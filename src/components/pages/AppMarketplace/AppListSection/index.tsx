/********************************************************************************
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

import { useTranslation } from 'react-i18next'
import {
  CircleProgress,
  ErrorBar,
  Typography,
} from '@catena-x/portal-shared-components'
import { useTheme } from '@mui/material'
import { AppListGroupView } from '../AppListGroupView'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import {
  useFetchActiveAppsQuery,
  useFetchFavoriteAppsQuery,
} from 'features/apps/apiSlice'
import CommonService from 'services/CommonService'
import { appsControlSelector } from 'features/apps/control'
import { type AppMarketplaceApp } from 'features/apps/types'
import { useEffect, useState } from 'react'
import { cloneDeep } from 'lodash'
import NoItems from 'components/pages/NoItems'
import {
  useAddItemMutation,
  useRemoveItemMutation,
} from 'features/apps/favorites/apiSlice'
import { useSelector } from 'react-redux'
import { error } from 'services/NotifyService'

export const label = 'AppList'

export default function AppListSection() {
  const { t } = useTranslation()
  const theme = useTheme()
  const { id } = useParams()
  const location = useLocation()

  const navigate = useNavigate()
  const {
    data,
    error: fetchError,
    isError,
    refetch,
  } = useFetchActiveAppsQuery()
  const { data: favoriteItems, refetch: refetchFavoriteApps } =
    useFetchFavoriteAppsQuery()

  const control = useSelector(appsControlSelector)
  const [list, setList] = useState<AppMarketplaceApp[]>([])
  const [favList, setFavList] = useState<string[]>([])

  const [addItem] = useAddItemMutation()
  const [removeItem] = useRemoveItemMutation()

  // Add an ESLint exception until there is a solution
  // eslint-disable-next-line
  const activeAppsError = fetchError as any

  const checkIsFavorite = (appId: string) => favList?.includes(appId)

  const addOrRemoveFavorite = (event: React.MouseEvent, appId: string) => {
    const favs = cloneDeep(favList)
    event.stopPropagation()

    if (checkIsFavorite(appId)) {
      removeItem(appId)
        .unwrap()
        .then(() => {
          favs.splice(favs.indexOf(appId), 1)
          arrangeDataList(list, favs)
          refetchFavoriteApps()
        })
        .catch((err) => {
          error(
            t('content.appstore.appOverviewSection.errorMsg'),
            '',
            err as object
          )
        })
    } else {
      addItem(appId)
        .unwrap()
        .then(() => {
          favs.push(appId)
          arrangeDataList(list, favs)
          refetchFavoriteApps()
        })
        .catch((err) => {
          error(
            t('content.appstore.appOverviewSection.errorMsg'),
            '',
            err as object
          )
        })
    }
  }

  const arrangeDataList = (d: AppMarketplaceApp[], favs: string[]) => {
    d?.forEach((i: AppMarketplaceApp) => {
      i.addButtonClicked = favs?.includes(i.id)
    })
    setList(d)
    setFavList(favs)
  }

  useEffect(() => {
    refetch()
  }, [id, location.key])

  useEffect(() => {
    if (data && favoriteItems) {
      const d = cloneDeep(data)
      arrangeDataList(d, favoriteItems)
    }
    refetchFavoriteApps()
  }, [data, favoriteItems])

  const renderProgress = () => (
    <div style={{ textAlign: 'center' }}>
      <CircleProgress
        variant="indeterminate"
        colorVariant="primary"
        size={50}
        sx={{ color: theme.palette.primary.main }}
      />
    </div>
  )

  const renderNoMatch = () => (
    <div style={{ textAlign: 'center' }}>
      <Typography variant="h5">
        {t('content.appstore.appOverviewSection.noMatch')}
      </Typography>
      <Typography variant="body1">
        {t('content.appstore.appOverviewSection.for')}
      </Typography>
    </div>
  )

  const renderGroups = () =>
    list ? (
      <AppListGroupView
        items={list
          ?.filter(
            (app) =>
              app?.name?.toLowerCase().includes(control.search.toLowerCase()) ??
              app?.title?.toLowerCase().includes(control.search.toLowerCase())
          )
          .map(CommonService.appToCard)
          .map((card) => ({
            ...card,
            onButtonClick: () => {
              navigate(`/appdetail/${card.id}`)
            },
            onSecondaryButtonClick: (e: React.MouseEvent) => {
              addOrRemoveFavorite(e, card.id)
            },
            addButtonClicked: card.addButtonClicked,
            description: card.description,
          }))}
        groupKey={control.group}
      />
    ) : (
      <></>
    )

  const renderList = () => {
    if (data && data.length === 0) return <NoItems />
    if (!data) return renderProgress()
    if (!data.length) return renderNoMatch()
    return renderGroups()
  }

  return (
    <section>
      {!isError ? (
        renderList()
      ) : (
        <ErrorBar
          errorText={
            activeAppsError?.data?.status >= 400 &&
            activeAppsError?.data?.status < 500
              ? t('content.appstore.appOverviewSection.dataLoadFailed')
              : t('content.appstore.appOverviewSection.loadFailed')
          }
          showButton={
            activeAppsError.code >= 500 && activeAppsError?.data?.status < 600
          }
          buttonText={t('error.tryAgain')}
          handleButton={refetch}
        />
      )}
    </section>
  )
}
