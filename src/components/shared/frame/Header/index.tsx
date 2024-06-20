/********************************************************************************
 * Copyright (c) 2023 BMW Group AG
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

import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Trans, useTranslation } from 'react-i18next'
import MenuIcon from '@mui/icons-material/Menu'
import { Box, useMediaQuery, useTheme } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import SortIcon from '@mui/icons-material/Sort'
import {
  Button,
  CustomAccordion,
  MainNavigation,
  Typography,
} from '@catena-x/portal-shared-components'
import type { MenuItem, Tree } from 'types/MainTypes'
import { getAssetBase } from 'services/EnvironmentService'
import {
  ApplicationStatus,
  useFetchApplicationsQuery,
} from 'features/registration/registrationApiSlice'
import {
  appearSearchSelector,
  setAppear,
  appearMenuSelector,
} from 'features/control/appear'
import { UserInfo } from '../UserInfo'
import { Logo } from '../Logo'
import RegistrationReviewOverlay from './RegistrationReviewOverlay'
import './Header.scss'
import RegistrationReviewContent from './RegistrationReviewOverlay/RegistrationReviewContent'
import RegistrationDeclinedOverlay from './RegistrationDeclinedOverlay'

export const Header = ({ main, user }: { main: Tree[]; user: string[] }) => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'), {
    defaultMatches: true,
  })

  const visible = useSelector(appearSearchSelector)
  const appearShow = useSelector(appearMenuSelector)

  const { data } = useFetchApplicationsQuery()
  const companyData = data?.[0]

  const [submittedOverlayOpen, setSubmittedOverlayOpen] = useState(
    companyData?.applicationStatus === ApplicationStatus.SUBMITTED
  )
  const [headerNote, setHeaderNote] = useState(false)

  const addTitle = (items: Tree[] | undefined) =>
    items?.map(
      (item: Tree): MenuItem => ({
        ...item,
        to: `/${item.name}`,
        title: t(`pages.${item.name}`),
        hint: item.hint ? t(`hints.${item.hint}`) : '',
        children: addTitle(item.children),
      })
    )

  const menu = addTitle(main) ?? []

  const renderFullText = () => {
    return (
      <div
        className="registration-review"
        style={{ width: isMobile ? '100%' : '40%', margin: '0 auto' }}
      >
        <RegistrationReviewContent />
        <div className="helpMain">
          <Trans>
            <Typography variant="label3">
              {t('content.registrationInreview.helpText')}
            </Typography>
            <Typography variant="label3" className="emailText">
              {t('content.registrationInreview.email')}
            </Typography>
          </Trans>
        </div>
      </div>
    )
  }

  const renderRegistrationNoteSection = () => {
    return (
      <div
        style={{
          margin: isMobile ? '75px 10px 40px' : '20px',
          border: '1px solid #FF7100',
          boxShadow: '0px 20px 40px rgba(80, 80, 80, 0.3)',
          borderRadius: '5px',
        }}
        className="registrationReviewNoteSection"
      >
        <CustomAccordion
          items={[
            {
              children: renderFullText(),
              expanded: false,
              icon: (
                <Typography variant="label3" className="noteReviewText">
                  <SortIcon className="subjectIcon" />
                  {isMobile
                    ? 'REGISTRATION IN REVIEW '
                    : t('content.registrationInreview.note')}
                </Typography>
              ),
              id: 'panel-1',
              title: '',
              titleElement: !isMobile ? (
                <div>
                  <Trans>
                    <Typography variant="label3">
                      {t('content.registrationInreview.noteDetail')}
                    </Typography>
                    <Typography variant="label3" className="emailText">
                      {t('content.registrationInreview.email')}
                    </Typography>
                  </Trans>
                </div>
              ) : (
                <></>
              ),
              buttonText: t('global.actions.close'),
            },
          ]}
        />
      </div>
    )
  }

  return (
    <>
      <header>
        <MainNavigation items={menu} component={NavLink}>
          <Logo />
          <div className="d-flex">
            <div
              onClick={() => dispatch(setAppear({ SEARCH: !visible }))}
              className="search-icon"
              onKeyUp={() => {
                // do nothing
              }}
            >
              <SearchIcon className="searchIcon" />
            </div>
            <Button
              size="small"
              color="secondary"
              variant="contained"
              onClick={() => {
                window.open(
                  `${document.location.origin}/documentation/`,
                  'documentation',
                  'noreferrer'
                )
              }}
              className="documentation"
            >
              {t('pages.help')}
            </Button>
            <UserInfo pages={user} />
          </div>
        </MainNavigation>
      </header>
      <div className="mobileNav">
        <div className="mobileHeader">
          <Link to={'/'} className="logo">
            <svg
              width="119"
              height="28"
              viewBox="0 0 119 26"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g id="Cofinity-X_Logo_Color">
                <g id="Cofinity-">
                  <g id="Group">
                    <path
                      id="Vector"
                      d="M69.1089 6.77649H66.0361V19.479H69.1089V6.77649Z"
                      fill="#4D4D4D"
                    ></path>
                    <path
                      id="Vector_2"
                      d="M57.6142 6.52954C54.0751 6.52954 51.4688 8.75179 51.4688 12.6202V19.4789H54.5415V12.7025C54.5415 10.6448 55.8584 9.54741 57.5868 9.54741C59.3152 9.54741 60.6321 10.6448 60.6321 12.7025V19.4789H63.7048V12.6202C63.7597 8.75179 61.1534 6.52954 57.6142 6.52954Z"
                      fill="#4D4D4D"
                    ></path>
                    <path
                      id="Vector_3"
                      d="M49.3559 6.77649H46.2832V19.479H49.3559V6.77649Z"
                      fill="#4D4D4D"
                    ></path>
                    <path
                      id="Vector_4"
                      d="M27.1335 6.52954C23.2926 6.52954 20.4668 9.27306 20.4668 13.1414C20.4668 17.0098 23.2652 19.7259 27.1335 19.7259C31.0019 19.7259 33.8003 17.0098 33.8003 13.1414C33.8003 9.27306 31.0019 6.52954 27.1335 6.52954ZM27.1335 16.7629C25.0485 16.7629 23.5944 15.2265 23.5944 13.1689C23.5944 11.1112 25.0485 9.57485 27.1335 9.57485C29.2186 9.57485 30.6727 11.0838 30.6727 13.1689C30.6727 15.2539 29.2186 16.7629 27.1335 16.7629Z"
                      fill="#4D4D4D"
                    ></path>
                    <path
                      id="Vector_5"
                      d="M9.9041 3.07274C12.7574 3.07274 14.9796 4.63655 15.9947 7.10571H19.4241C18.2718 2.77095 14.6778 0 9.9041 0C4.06041 0 0 4.14271 0 9.87667C0 15.6106 4.06041 19.7533 9.9041 19.7533C14.6504 19.7533 18.217 17.0647 19.4241 12.7025H15.9947C14.9522 15.2265 12.7574 16.7355 9.9041 16.7355C5.89856 16.7355 3.23735 13.7999 3.23735 9.9041C3.23735 6.00831 5.926 3.07274 9.9041 3.07274Z"
                      fill="#4D4D4D"
                    ></path>
                    <path
                      id="Vector_6"
                      d="M74.7056 14.4309V9.60235H79.0678V6.77653H74.7056V1.56384H71.6055V14.7327C71.6055 18.025 73.3339 19.6436 76.3792 19.6436C77.2571 19.6436 78.3545 19.5888 79.3971 19.4516V16.4886C78.3271 16.6258 77.5863 16.6532 76.9828 16.6532C75.3092 16.6532 74.7056 15.9673 74.7056 14.4309Z"
                      fill="#4D4D4D"
                    ></path>
                    <path
                      id="Vector_7"
                      d="M67.6002 0.822998C66.5028 0.822998 65.6523 1.72836 65.6523 2.7709C65.6523 3.81343 66.5303 4.71879 67.6002 4.71879C68.6702 4.71879 69.5207 3.81343 69.5207 2.7709C69.5207 1.72836 68.6702 0.822998 67.6002 0.822998Z"
                      fill="#4D4D4D"
                    ></path>
                    <path
                      id="Vector_8"
                      d="M100.88 9.87671H96.2705V12.6202H100.88V9.87671Z"
                      fill="#4D4D4D"
                    ></path>
                    <path
                      id="Vector_9"
                      d="M90.3987 13.0866C90.3987 15.0619 89.0269 16.1319 87.3534 16.1319C85.6798 16.1319 84.3355 15.0619 84.3355 13.0866V6.77649H81.2354V13.0591C81.2354 16.9001 83.6222 19.0949 87.1065 19.0949C88.4782 19.0949 89.6305 18.5187 90.3987 17.5036V19.0949C90.3987 21.1525 89.0269 22.2774 87.079 22.2774C85.7073 22.2774 84.7745 21.6189 84.3081 20.7136L82.0035 22.8809C83.1284 24.335 84.8842 25.1581 87.0516 25.1581C90.8102 25.1581 93.444 22.9084 93.444 19.0949V6.77649H90.3438V13.0866H90.3987Z"
                      fill="#4D4D4D"
                    ></path>
                    <path
                      id="Vector_10"
                      d="M37.1751 5.40467V6.80386H34.1572V9.57482H37.1751V19.4789H40.2478V9.57482H44.3631V6.77643H40.2478V5.45954C40.2478 4.08778 40.8514 3.15499 42.2506 3.15499C42.525 3.15499 43.4578 3.18242 44.3631 3.20986V0.246856C43.4029 0.191986 42.3878 0.164551 42.0311 0.164551C38.9584 0.164551 37.2025 1.9204 37.1751 5.40467Z"
                      fill="#4D4D4D"
                    ></path>
                    <path
                      id="Vector_11"
                      d="M47.8473 0.822998C46.7499 0.822998 45.8994 1.72836 45.8994 2.7709C45.8994 3.81343 46.7773 4.71879 47.8473 4.71879C48.9173 4.71879 49.7952 3.81343 49.7952 2.7709C49.7952 1.72836 48.9173 0.822998 47.8473 0.822998Z"
                      fill="#4D4D4D"
                    ></path>
                  </g>
                </g>
                <g id="X">
                  <path
                    id="Vector_12"
                    d="M114.158 0.0548096L109.686 6.99591C109.549 7.21539 109.384 7.2977 109.219 7.2977C109.055 7.2977 108.89 7.21539 108.753 6.99591L104.199 0.0548096H100.221L106.256 8.88894C106.393 9.08099 106.531 9.30047 106.668 9.46508C106.531 9.60225 106.421 9.76686 106.311 9.90404L99.6719 19.4789H103.54L108.561 11.9617C108.698 11.7422 108.835 11.6599 109.027 11.6599C109.192 11.6599 109.329 11.7422 109.494 11.9617L114.542 19.4789H118.52L111.853 9.90404C111.743 9.73943 111.634 9.57482 111.496 9.43764C111.634 9.27303 111.798 9.08099 111.908 8.88894L117.916 0.0548096H114.158Z"
                    fill="url(#paint0_linear_560_2363)"
                  ></path>
                </g>
              </g>
              <defs>
                <linearGradient
                  id="paint0_linear_560_2363"
                  x1="99.6719"
                  y1="9.68917"
                  x2="118.52"
                  y2="9.68917"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stop-color="#FDB913"></stop>
                  <stop offset="1" stop-color="#D31184"></stop>
                </linearGradient>
              </defs>
            </svg>
          </Link>
        </div>
        <div className="mobileHeaderRight">
          <div
            onClick={() => dispatch(setAppear({ SEARCH: !visible }))}
            className="mobile-search-icon"
            onKeyDown={() => {
              // do nothing
            }}
          >
            <SearchIcon className="searchIcon" />
          </div>
          <Box
            onClick={() => dispatch(setAppear({ MENU: !appearShow }))}
            className="mobile-search-icon"
            onKeyDown={() => {
              // do nothing
            }}
          >
            <MenuIcon className="searchIcon" />
          </Box>
        </div>
      </div>
      {headerNote && renderRegistrationNoteSection()}
      <RegistrationReviewOverlay
        openDialog={submittedOverlayOpen}
        handleOverlayClose={() => {
          setSubmittedOverlayOpen(false)
          setHeaderNote(true)
        }}
      />
      <RegistrationDeclinedOverlay
        openDialog={
          companyData?.applicationStatus === ApplicationStatus.DECLINED
        }
      />
    </>
  )
}
