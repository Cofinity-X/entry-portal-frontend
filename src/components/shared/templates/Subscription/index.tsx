/********************************************************************************
 * Copyright (c) 2023 Mercedes-Benz Group AG and BMW Group AG
 * Copyright (c) 2023 Contributors to the Eclipse Foundation
 *
 * See the NOTICE file(s) distributed with this work for additional
 * information regarding copyright ownership.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Apache License, Version 2.0 which is available at
 * https://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 ********************************************************************************/

import { useEffect, useCallback, useMemo, useReducer } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTheme } from '@mui/material'
import debounce from 'lodash.debounce'
import { OVERLAYS } from 'types/Constants'
import {
  SearchInput,
  Typography,
  ViewSelector,
  SortOption,
  PageSnackbar,
  LoadMoreButton,
  CircleProgress,
} from '@catena-x/portal-shared-components'
import type {
  AppFiltersResponse,
  SubscriptionContent,
  SubscriptionRequestBody,
} from 'features/appSubscription/appSubscriptionApiSlice'
import { currentProviderSuccessType } from 'features/serviceProvider/slice'
import './style.scss'
import SubscriptionElements from './SubscriptionElements'
import type { SubscriptionRequestType } from 'features/serviceSubscription/serviceSubscriptionApiSlice'
import type { RootState } from 'features/store'
import { show } from 'features/control/overlay'
import SortImage from 'components/shared/frame/SortImage'
import { isCompanyName } from 'types/Patterns'

export enum SubscriptionTypes {
  APP_SUBSCRIPTION = 'app',
  SERVICE_SUBSCRIPTION = 'service',
}

enum FilterType {
  REQUEST = 'request',
  ACTIVE = 'active',
  SHOWALL = 'showAll',
  INACTIVE = 'inactive',
}

enum StatusIdType {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

enum SortType {
  CUSTOMER = 'customer',
  OFFER = 'offer',
  COMPANY_NAME_DESC = 'CompanyNameDesc',
  OFFER_IDS_ASC = 'OfferIdAsc',
}

enum ViewActionEnum {
  STATUSID = 'STATUSID',
  OFFERID = 'OFFERID',
  SORTOPTION = 'SORTOPTION',
}

enum ActionKind {
  SET_SEARCH_EXPR = 'SET_SEARCH_EXPR',
  SET_SHOW_MODAL = 'SET_SHOW_MODAL',
  SET_SELECTED = 'SET_SELECTED',
  SET_SORT_OPTION = 'SET_SORT_OPTION',
  SET_CARD_SUBSCRIPTION = 'SET_CARD_SUBSCRIPTION',
  SET_SERVICE_PROVIDER_SUCCESS = 'SET_SERVICE_PROVIDER_SUCCESS',
  SET_PAGE = 'SET_PAGE',
  SET_STATUS_ID = 'SET_STATUS_ID',
  SET_SORTING_TYPE = 'SET_SORTING_TYPE',
  SET_FETCH_ARGS = 'SET_FETCH_ARGS',
  SET_PAGE_FETCH_ARGS = 'SET_PAGE_FETCH_ARGS',
  SET_PAGE_STATUS_FETCH_ARGS = 'SET_PAGE_STATUS_FETCH_ARGS',
  SET_SUBSCRIPTION = 'SET_SUBSCRIPTION',
  SET_SUBSCRIPTION_AND_CARD_SUBSCRIPTION = 'SET_SUBSCRIPTION_AND_CARD_SUBSCRIPTION',
  SET_PAGE_SORTING_TYPE_FETCH_ARGS = 'SET_PAGE_SORTING_TYPE_FETCH_ARGS',
  SET_PAGE_STATUS_SORTING_FETCH_ARGS = 'SET_PAGE_STATUS_SORTING_FETCH_ARGS',
  SET_APP_FILTERS = 'SET_APP_FILTERS',
  SET_ACTIVE_APP_FILTER = 'SET_ACTIVE_APP_FILTER',
  SET_COMPANY_NAME = 'SET_COMPANY_NAME',
  DECLINE_SUBSCRIPTION = 'DECLINE_SUBSCRIPTION',
}

type State = {
  searchExpr: string
  showModal: boolean
  selected: string
  sortOption: string
  cardSubscriptions: SubscriptionContent[]
  serviceProviderSuccess: boolean
  page: number
  statusId: string
  sortingType: string
  fetchArgs: SubscriptionRequestType | SubscriptionRequestBody
  subscriptions: SubscriptionContent[]
  appFilters: AppFiltersResponse[]
  activeAppFilter: string
  companyName: string
}

type Action = {
  type: string
  // Add an ESLint exception until there is a solution
  // eslint-disable-next-line
  payload: any
}

const initialState: State = {
  searchExpr: '',
  showModal: false,
  selected: FilterType.SHOWALL,
  sortOption: SortType.CUSTOMER,
  cardSubscriptions: [],
  serviceProviderSuccess: false,
  page: 0,
  statusId: '',
  sortingType: SortType.COMPANY_NAME_DESC,
  fetchArgs: {
    page: 0,
    statusId: '',
    sortingType: SortType.COMPANY_NAME_DESC,
    companyName: '',
  },
  subscriptions: [],
  appFilters: [],
  activeAppFilter: '',
  companyName: '',
}

function reducer(state: State, { type, payload }: Action) {
  switch (type) {
    case ActionKind.SET_SEARCH_EXPR:
      return { ...state, searchExpr: payload }
    case ActionKind.SET_COMPANY_NAME:
      return { ...state, companyName: payload }
    case ActionKind.SET_SHOW_MODAL:
      return { ...state, showModal: payload }
    case ActionKind.SET_SELECTED:
      return { ...state, selected: payload }
    case ActionKind.SET_SORT_OPTION:
      return { ...state, sortOption: payload }
    case ActionKind.SET_CARD_SUBSCRIPTION:
      return { ...state, cardSubscriptions: payload }
    case ActionKind.SET_SUBSCRIPTION:
      return { ...state, subscriptions: payload }
    case ActionKind.SET_SERVICE_PROVIDER_SUCCESS:
      return { ...state, serviceProviderSuccess: payload }
    case ActionKind.SET_PAGE:
      return { ...state, page: payload }
    case ActionKind.SET_STATUS_ID:
      return { ...state, statusId: payload }
    case ActionKind.SET_SORTING_TYPE:
      return { ...state, sortingType: payload }
    case ActionKind.SET_FETCH_ARGS:
      return { ...state, fetchArgs: payload }
    case ActionKind.SET_PAGE_STATUS_SORTING_FETCH_ARGS:
      return {
        ...state,
        page: payload.page,
        statusId: payload.statusId,
        offerId: payload.offerId,
        fetchArgs: payload.fetchArgs,
        sortingType: payload.sortingType,
        subscriptions: [],
        cardSubscriptions: [],
      }
    case ActionKind.SET_PAGE_SORTING_TYPE_FETCH_ARGS:
      return {
        ...state,
        page: payload.page,
        sortingType: payload.sortingType,
        fetchArgs: payload.fetchArgs,
      }
    case ActionKind.SET_PAGE_FETCH_ARGS:
      return {
        ...state,
        page: payload.page,
        fetchArgs: payload.fetchArgs,
      }
    case ActionKind.SET_SUBSCRIPTION_AND_CARD_SUBSCRIPTION:
      return {
        ...state,
        subscriptions: setData(state, payload),
        cardSubscriptions: setData(state, payload),
      }
    case ActionKind.SET_APP_FILTERS:
      return {
        ...state,
        appFilters: payload,
      }
    case ActionKind.SET_ACTIVE_APP_FILTER:
      return {
        ...state,
        activeAppFilter: payload,
      }
    case ActionKind.DECLINE_SUBSCRIPTION:
      return {
        ...state,
        subscriptions: state.subscriptions
          .map((content) => ({
            ...content,
            companySubscriptionStatuses:
              content.companySubscriptionStatuses.filter(
                (sub) => sub.subscriptionId !== payload
              ),
          }))
          .filter((content) => content.companySubscriptionStatuses.length > 0),
        cardSubscriptions: state.cardSubscriptions
          .map((content) => ({
            ...content,
            companySubscriptionStatuses:
              content.companySubscriptionStatuses.filter(
                (sub) => sub.subscriptionId !== payload
              ),
          }))
          .filter((content) => content.companySubscriptionStatuses.length > 0),
      }
    default:
      return state
  }
}

const setData = (
  state: {
    subscriptions: SubscriptionContent[]
  },
  payload: {
    meta: {
      page: number
    }
    content: SubscriptionContent[]
  }
) => {
  if (payload?.meta) {
    if (payload.meta.page === 0) {
      return payload.content
    }
    const existing = new Map(
      state.subscriptions.map((item) => [item.offerId, item])
    )
    for (const item of payload.content) {
      existing.set(item.offerId, item)
    }
    return Array.from(existing.values())
  } else {
    return []
  }
}

interface SubscriptionType {
  providerSuccessMessage: string
  // Add an ESLint exception until there is a solution
  // eslint-disable-next-line
  fetchQuery: (Obj: SubscriptionRequestType | SubscriptionRequestBody) => any
  // Add an ESLint exception until there is a solution
  // eslint-disable-next-line
  fetchAppFilters?: () => any
  headline: string
  subHeading: string
  description: string
  readMore: string
  registerURL: string
  searchPlaceHoder: string
  sortOptionLabels: {
    customer: string
    offer: string
  }
  tabLabels: {
    request: string
    active: string
    inactive: string
    showAll: string
  }
  doNotShowAutoSetup?: boolean
  currentSuccessType: (state: RootState) => boolean
  loadMoreButtonText?: string
  type?: string
  activeAppHeading?: string
  subscriptionHeading?: string
}

export default function Subscription({
  providerSuccessMessage,
  headline,
  fetchQuery,
  fetchAppFilters,
  subHeading,
  description,
  readMore,
  registerURL,
  searchPlaceHoder,
  sortOptionLabels,
  tabLabels,
  doNotShowAutoSetup,
  currentSuccessType,
  loadMoreButtonText = 'Load More',
  type = SubscriptionTypes.APP_SUBSCRIPTION,
  activeAppHeading = 'Apps Offered',
  subscriptionHeading = 'Subscriptions',
}: SubscriptionType) {
  const dispatch = useDispatch()
  const theme = useTheme()
  const [
    {
      searchExpr,
      showModal,
      selected,
      sortOption,
      cardSubscriptions,
      serviceProviderSuccess,
      page,
      statusId,
      sortingType,
      fetchArgs,
      subscriptions,
      appFilters,
      activeAppFilter,
    },
    setState,
  ] = useReducer(reducer, initialState)
  let appFiltersData: AppFiltersResponse[] = useMemo(() => [], [])
  if (fetchAppFilters) {
    const { data } = fetchAppFilters()
    appFiltersData = data?.content
  }

  const {
    data,
    refetch,
    isFetching,
    isSuccess: apiSuccess,
  } = fetchQuery(fetchArgs)
  const isSuccess = useSelector(currentProviderSuccessType)
  const success: boolean = useSelector(currentSuccessType)

  const declineSubscriptionCallback = useCallback(
    (subscriptionId: string) => {
      setState({
        type: ActionKind.DECLINE_SUBSCRIPTION,
        payload: subscriptionId,
      })
      refetch() // Force immediate refetch after decline
    },
    [refetch]
  )

  useEffect(() => {
    if (data?.content) {
      setState({
        type: ActionKind.SET_SUBSCRIPTION_AND_CARD_SUBSCRIPTION,
        payload: data,
      })
    }
  }, [data])

  useEffect(() => {
    if (appFiltersData?.length) {
      setState({
        type: ActionKind.SET_APP_FILTERS,
        payload: appFiltersData,
      })
    }
  }, [appFiltersData, type])

  const setView = (e: React.MouseEvent<HTMLInputElement>) => {
    let status = ''
    if (e.currentTarget.value === FilterType.REQUEST) {
      status = StatusIdType.PENDING
    } else if (e.currentTarget.value === FilterType.ACTIVE) {
      status = StatusIdType.ACTIVE
    } else if (e.currentTarget.value === FilterType.INACTIVE) {
      status = StatusIdType.INACTIVE
    }
    setState({
      type: ActionKind.SET_SORTING_TYPE,
      payload: status,
    })
    setState({ type: ActionKind.SET_SELECTED, payload: e.currentTarget.value })
    resetCardsAndSetFetchArgs(status, ViewActionEnum.STATUSID)
  }

  const resetCardsAndSetFetchArgs = (
    value: string,
    type: string,
    cp?: string
  ) => {
    setState({
      type: ActionKind.SET_PAGE_STATUS_SORTING_FETCH_ARGS,
      payload: {
        page: 0,
        statusId: type === ViewActionEnum.STATUSID ? value : statusId,
        offerId: type === ViewActionEnum.OFFERID ? value : activeAppFilter,
        sortingType: type === ViewActionEnum.SORTOPTION ? value : sortingType,
        fetchArgs: {
          page: 0,
          statusId: type === ViewActionEnum.STATUSID ? value : statusId,
          offerId: type === ViewActionEnum.OFFERID ? value : activeAppFilter,
          sortingType: type === ViewActionEnum.SORTOPTION ? value : sortingType,
          companyName: cp,
        },
      },
    })
  }

  const setSortOptionFunc = (value: string) => {
    setState({
      type: ActionKind.SET_SORT_OPTION,
      payload: value,
    })
    resetCardsAndSetFetchArgs(
      value === SortType.OFFER
        ? SortType.OFFER_IDS_ASC
        : SortType.COMPANY_NAME_DESC,
      ViewActionEnum.SORTOPTION
    )
  }

  useEffect(() => {
    isSuccess &&
      setState({
        type: ActionKind.SET_SERVICE_PROVIDER_SUCCESS,
        payload: true,
      })
  }, [isSuccess])

  const nextPage = () => {
    setState({
      type: ActionKind.SET_PAGE_FETCH_ARGS,
      payload: {
        page: page + 1,
        fetchArgs: {
          page: page + 1,
          statusId,
          sortingType,
        },
      },
    })
  }

  const sortOptions = [
    {
      label: sortOptionLabels.customer,
      value: SortType.CUSTOMER,
    },
    {
      label: sortOptionLabels.offer,
      value: SortType.OFFER,
    },
  ]

  const filterButtons = [
    {
      buttonText: tabLabels.request,
      buttonValue: FilterType.REQUEST,
      onButtonClick: setView,
    },
    {
      buttonText: tabLabels.active,
      buttonValue: FilterType.ACTIVE,
      onButtonClick: setView,
    },
    {
      buttonText: tabLabels.showAll,
      buttonValue: FilterType.SHOWALL,
      onButtonClick: setView,
    },
  ]

  useEffect(() => {
    refetch()
  }, [success, refetch])

  const debouncedFilter = useMemo(
    () =>
      debounce((expr: string) => {
        resetCardsAndSetFetchArgs('', '', expr)
      }, 300),
    [subscriptions]
  )

  const searchDataFn = useCallback(
    (expr: string) => {
      setState({ type: ActionKind.SET_SEARCH_EXPR, payload: expr })
      const isValidate = isCompanyName(expr)
      if (isValidate || expr === '') debouncedFilter(expr)
    },
    [debouncedFilter]
  )

  const handleActiveAppFilter = (appId: string) => {
    appId = activeAppFilter === appId ? '' : appId
    setState({
      type: ActionKind.SET_ACTIVE_APP_FILTER,
      payload: appId,
    })
    resetCardsAndSetFetchArgs(appId, ViewActionEnum.OFFERID)
  }

  return (
    <main className="appSubscription">
      <div className="mainContainer">
        <div className="mainRow">
          <Typography className="heading" variant="h2">
            {headline}
          </Typography>
          <Typography className="subheading" variant="body1">
            {subHeading}
          </Typography>
          {!doNotShowAutoSetup && (
            <Typography className="description" variant="caption2">
              {description}
            </Typography>
          )}
          {!doNotShowAutoSetup && (
            <div className="subDescription">
              <Typography
                className="readMore"
                variant="label3"
                sx={{
                  cursor: 'pointer',
                  color: '#0088CC',
                  marginTop: '30px',
                }}
                onClick={() =>
                  window.open(
                    '/documentation/?path=user%2F04.+App%28s%29%2F05.+App+Subscription%2F03.+Subscription+Overview+%28App+Provider%29.md',
                    '_blank',
                    'noopener'
                  )
                }
              >
                {readMore}
              </Typography>
              <Typography
                variant="label3"
                onClick={() => dispatch(show(OVERLAYS.ADD_SERVICE_PROVIDER))}
                sx={{ cursor: 'pointer' }}
              >
                {registerURL}
              </Typography>
            </div>
          )}
          <div>
            <div className="searchContainer">
              <SearchInput
                placeholder={searchPlaceHoder}
                value={searchExpr}
                autoFocus={false}
                onChange={(e) => {
                  searchDataFn(e.target.value)
                }}
                autoComplete="off"
              />
            </div>
            <div
              className="filterSection"
              onMouseLeave={() => {
                setState({ type: ActionKind.SET_SHOW_MODAL, payload: false })
              }}
            >
              <ViewSelector activeView={selected} views={filterButtons} />
              <SortImage
                onClick={() => {
                  setState({ type: ActionKind.SET_SHOW_MODAL, payload: true })
                }}
                selected={showModal}
              />
              <div className="sortSection">
                <SortOption
                  show={showModal}
                  selectedOption={sortOption}
                  setSortOption={setSortOptionFunc}
                  sortOptions={sortOptions}
                />
              </div>
            </div>
            {appFilters && appFilters.length > 0 && (
              <>
                <Typography variant="h4">{activeAppHeading}</Typography>
                <div className="appFilterSection">
                  {appFilters.map((app: AppFiltersResponse) => {
                    return (
                      <Typography
                        className={`appName ${
                          activeAppFilter === app.id ? 'activeFilter' : ''
                        }`}
                        variant="body3"
                        onClick={() => {
                          handleActiveAppFilter(app.id)
                        }}
                        key={app.id}
                      >
                        {app.name}
                      </Typography>
                    )
                  })}
                </div>
              </>
            )}
            {isFetching ? (
              <div className="loading-progress">
                <CircleProgress
                  variant="indeterminate"
                  colorVariant="primary"
                  size={50}
                  sx={{
                    color: theme.palette.primary.main,
                  }}
                />
              </div>
            ) : (
              <SubscriptionElements
                subscriptions={cardSubscriptions}
                type={type}
                refetch={refetch}
                isSuccess={apiSuccess}
                subscriptionHeading={subscriptionHeading}
                declineSubscription={declineSubscriptionCallback} // Add this
              />
            )}
          </div>
          {!isFetching &&
            subscriptions?.length > 0 &&
            data?.meta &&
            data?.meta?.totalPages > page + 1 && (
              <div
                style={{
                  textAlign: 'center',
                  marginTop: '30px',
                }}
              >
                <LoadMoreButton onClick={nextPage} label={loadMoreButtonText} />
              </div>
            )}
        </div>
      </div>
      {
        <PageSnackbar
          open={serviceProviderSuccess}
          onCloseNotification={() => {
            setState({
              type: ActionKind.SET_SERVICE_PROVIDER_SUCCESS,
              payload: false,
            })
          }}
          severity="success"
          description={providerSuccessMessage}
          showIcon={true}
        />
      }
    </main>
  )
}
