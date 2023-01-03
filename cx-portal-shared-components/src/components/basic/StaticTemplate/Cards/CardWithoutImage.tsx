/********************************************************************************
 * Copyright (c) 2021,2022 Mercedes-Benz Group AG and BMW Group AG
 * Copyright (c) 2021,2022 Contributors to the Eclipse Foundation
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

import { CardDetailsProps } from '../StaticTypes'
import CardWithText from './CardWithText'
import { Box } from '@mui/material'

export default function CardWithoutImage({
  detail,
  grid = 3,
}: {
  detail: CardDetailsProps
  grid: number
}) {
  const cardContainer = {
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    marginBottom: '96px',
    maxWidth: '33%',
  }
  return (
    <Box
      key={detail.id}
      sx={{
        ...cardContainer,
      }}
      style={{
        backgroundColor: detail.backgroundColor,
        border: '1px solid rgba(15, 113, 203, 1)',
        padding: '30px',
        width: `${100 / grid}%`,
      }}
    >
      <CardWithText card={detail} isImage={false} />
    </Box>
  )
}