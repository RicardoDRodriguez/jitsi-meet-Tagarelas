import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from 'tss-react/mui';

import { IReduxState } from '../../../app/types';
import participantsPaneTheme from '../../../base/components/themes/participantsPaneTheme.json';
import { openDialog } from '../../../base/dialog/actions';
import { IconCloseLarge, IconDotsHorizontal } from '../../../base/icons/svg';
import { isLocalParticipantModerator } from '../../../base/participants/functions';
import Button from '../../../base/ui/components/web/Button';
import ClickableIcon from '../../../base/ui/components/web/ClickableIcon';
import { BUTTON_TYPES } from '../../../base/ui/constants.web';
import { findAncestorByClass } from '../../../base/ui/functions.web';
import { isAddBreakoutRoomButtonVisible } from '../../../breakout-rooms/functions';
import MuteEveryoneDialog from '../../../video-menu/components/web/MuteEveryoneDialog';
import { close } from '../../actions.web';
import {
    getDatabase,
    getParticipantsPaneOpen,
    getSortedParticipantIds,
    isMoreActionsVisible,
    isMuteAllVisible
} from '../../functions';
import { AddBreakoutRoomButton } from '../breakout-rooms/components/web/AddBreakoutRoomButton';
import { RoomList } from '../breakout-rooms/components/web/RoomList';

import { FooterContextMenu } from './FooterContextMenu';
import LobbyParticipants from './LobbyParticipants';
import MeetingParticipants from './MeetingParticipants';
import VisitorsList from './VisitorsList';

/**
 * Pacotes do Participometro
 */
import LiveGaugeChart from '../gaugemeter/LiveGaugeChart';
import AvatarProgress from '../gaugemeter/AvatarProgress';
import DataBaseForGauge from '../gaugemeter/DataBaseForGauge';
import { Container } from '@mui/material';

const useStyles = makeStyles()(theme => {
    return {
        participantsPane: {
            backgroundColor: theme.palette.ui01,
            flexShrink: 0,
            overflow: 'auto',
            position: 'relative',
            transition: 'width .16s ease-in-out',
            width: '315px',
            zIndex: 0,
            display: 'flex',
            flexDirection: 'column',
            fontWeight: 600,
            height: '100%',

            [[ '& > *:first-child', '& > *:last-child' ] as any]: {
                flexShrink: 0
            },

            '@media (max-width: 580px)': {
                height: '100dvh',
                position: 'fixed',
                left: 0,
                right: 0,
                top: 0,
                width: '100%'
            }
        },

        container: {
            boxSizing: 'border-box',
            flex: 1,
            overflowY: 'auto',
            position: 'relative',
            padding: `0 ${participantsPaneTheme.panePadding}px`,

            '&::-webkit-scrollbar': {
                display: 'none'
            }
        },

        closeButton: {
            alignItems: 'center',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center'
        },

        header: {
            alignItems: 'center',
            boxSizing: 'border-box',
            display: 'flex',
            height: '60px',
            padding: `0 ${participantsPaneTheme.panePadding}px`,
            justifyContent: 'flex-end'
        },

         headerh3:  {
            align: 'center',
            alignItems: 'center',
            boxSizing: 'border-box',
            display: 'flex',
            // height: '30px',
            padding: `0 ${participantsPaneTheme.panePadding}px`,
            justifyContent: 'flex-center',
            fontSize: '1.17em', // Tamanho de fonte padrão para <h3>
            fontWeight: 'bold', // Peso da fonte padrão para <h3>
            margin: '1em 0', // Margem padrão para <h3>
            lineHeight: '1.5', // Altura da linha para melhorar a legibilidade
        },
        
        headerh5: {
            align: 'center',
            alignItems: 'center',
            boxSizing: 'border-box',
            display: 'flex',
            // height: '30px',
            padding: `0 ${participantsPaneTheme.panePadding}px`,
            justifyContent: 'flex-center',
            fontSize: '0.83em', // Tamanho de fonte padrão para <h5>
            fontWeight: 'bold', // Peso da fonte padrão para <h5>
            margin: '1.67em 0', // Margem padrão para <h5>
            lineHeight: '1.5', // Altura da linha para melhorar a legibilidade
        },

        antiCollapse: {
            fontSize: 0,

            '&:first-child': {
                display: 'none'
            },

            '&:first-child + *': {
                marginTop: 0
            }
        },

        footer: {
            display: 'flex',
            justifyContent: 'flex-end',
            padding: `${theme.spacing(4)} ${participantsPaneTheme.panePadding}px`,

            '& > *:not(:last-child)': {
                marginRight: theme.spacing(3)
            }
        },

        footerMoreContainer: {
            position: 'relative'
        }
    };
});

const ParticipantsPane = () => {
    const { classes, cx } = useStyles();
    const paneOpen = useSelector(getParticipantsPaneOpen);
    const isBreakoutRoomsSupported = useSelector((state: IReduxState) => state['features/base/conference'])
        .conference?.getBreakoutRooms()?.isSupported();

    const showAddRoomButton = useSelector(isAddBreakoutRoomButtonVisible);
    const showFooter = useSelector(isLocalParticipantModerator);
    const showMuteAllButton = useSelector(isMuteAllVisible);
    const showMoreActionsButton = useSelector(isMoreActionsVisible);
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const [ contextOpen, setContextOpen ] = useState(false);
    const [ searchString, setSearchString ] = useState('');
    
    
    const onWindowClickListener = useCallback((e: any) => {
        if (contextOpen && !findAncestorByClass(e.target, classes.footerMoreContainer)) {
            setContextOpen(false);
        }
    }, [ contextOpen ]);

    useEffect(() => {
        window.addEventListener('click', onWindowClickListener);

        return () => {
            window.removeEventListener('click', onWindowClickListener);
        };
    }, []);

    const onClosePane = useCallback(() => {
        dispatch(close());
    }, []);

    const onDrawerClose = useCallback(() => {
        setContextOpen(false);
    }, []);

    const onMuteAll = useCallback(() => {
        dispatch(openDialog(MuteEveryoneDialog));
    }, []);

    const onToggleContext = useCallback(() => {
        setContextOpen(open => !open);
    }, []);

    /**
     * Se o painel não for aberto retornar null
     * ----------------------------------------
     */
    if (!paneOpen) {
        return null;
    }

    /**
     * GaugeChart e do ProgressBar 
     */
    const database = new DataBaseForGauge();
    return (
        <div className = { cx('participants_pane', classes.participantsPane) }>
        
            <div className = { classes.header }>
                <ClickableIcon
                    accessibilityLabel = { t('participantsPane.close', 'Close') }
                    icon = { IconCloseLarge }
                    onClick = { onClosePane } />
            </div>
            
            <div className = { classes.headerh3 }>
                Participômetro
            </div>
            
            <div className = { classes.headerh5 }>    
                (Distribuição dos Tempos de Fala)
            </div>

            <div className = { classes.container }>
                <br className = { classes.antiCollapse } />
                <LiveGaugeChart database={database} />
            </div>    
            
            <div className = { classes.container }>
                <br className = { classes.antiCollapse } />
                <AvatarProgress  database={database} />
            </div>
        
        </div>

    );
};


export default ParticipantsPane;
