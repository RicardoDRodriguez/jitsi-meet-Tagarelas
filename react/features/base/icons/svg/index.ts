import withBranding from '../components/withBranding';

import { DEFAULT_ICON } from './constants';

const {
    IconAddUser,
    IconArrowBack,
    IconArrowDown,
    IconArrowDownLarge,
    IconArrowLeft,
    IconArrowUp,
    IconArrowUpLarge,
    IconAudioOnly,
    IconAudioOnlyOff,
    IconBluetooth,
    IconBell,
    IconCalendar,
    IconCameraRefresh,
    IconCar,
    IconChatUnread,
    IconCheck,
    IconCloseCircle,
    IconCloseLarge,
    IconCloudUpload,
    IconCode,
    IconConnection,
    IconConnectionInactive,
    IconCopy,
    IconDeviceHeadphone,
    IconDotsHorizontal,
    IconDownload,
    IconE2EE,
    IconEdit,
    IconEnlarge,
    IconEnterFullscreen,
    IconEnvelope,
    IconEmotionsAngry,
    IconEmotionsDisgusted,
    IconEmotionsFearful,
    IconEmotionsHappy,
    IconEmotionsNeutral,
    IconEmotionsSad,
    IconEmotionsSurprised,
    IconExclamationSolid,
    IconExclamationTriangle,
    IconExitFullscreen,
    IconFaceSmile,
    IconFavorite,
    IconFavoriteSolid,
    IconFeedback,
    IconGear,
    IconGoogle,
    IconHangup,
    IconHelp,
    IconHighlight,
    IconImage,
    IconInfo,
    IconInfoCircle,
    IconMessage,
    IconMeter,
    IconMic,
    IconMicSlash,
    IconModerator,
    IconNoiseSuppressionOff,
    IconNoiseSuppressionOn,
    IconArrowRight,
    IconOffice365,
    IconPerformance,
    IconPhoneRinging,
    IconPin,
    IconPinned,
    IconPlay,
    IconPlus,
    IconRaiseHand,
    IconRecord,
    IconRecordAccount,
    IconRecordContact,
    IconRecordLead,
    IconRecordOpportunity,
    IconRemoteControlStart,
    IconRemoteControlStop,
    IconReply,
    IconRestore,
    IconRingGroup,
    IconScreenshare,
    IconSearch,
    IconSecurityOff,
    IconSecurityOn,
    IconSend,
    IconShare,
    IconShareDoc,
    IconShortcuts,
    IconSip,
    IconSites,
    IconStop,
    IconSubtitles,
    IconTileView,
    IconTrash,
    IconUserDeleted,
    IconUsers,
    IconUser,
    IconVideo,
    IconVideoOff,
    IconVolumeOff,
    IconVolumeUp,
    IconWarning,
    IconWarningCircle,
    IconWhiteboard,
    IconWhiteboardHide,
    IconWifi1Bar,
    IconWifi2Bars,
    IconWifi3Bars,
    IconYahoo
} = Object.keys(DEFAULT_ICON).reduce((exportedIcons: Record<string, any>, key) => {
    return {
        ...exportedIcons,
        [key]: withBranding({
            iconName: key,
            DefaultIcon: DEFAULT_ICON[key]
        })
    };
}, {});

export {
    IconAddUser,
    IconArrowBack,
    IconArrowDown,
    IconArrowDownLarge,
    IconArrowLeft,
    IconArrowUp,
    IconArrowUpLarge,
    IconAudioOnly,
    IconAudioOnlyOff,
    IconBluetooth,
    IconBell,
    IconCalendar,
    IconCameraRefresh,
    IconCar,
    IconChatUnread,
    IconCheck,
    IconCloseCircle,
    IconCloseLarge,
    IconCloudUpload,
    IconCode,
    IconConnection,
    IconConnectionInactive,
    IconCopy,
    IconDeviceHeadphone,
    IconDotsHorizontal,
    IconDownload,
    IconE2EE,
    IconEdit,
    IconEnlarge,
    IconEnterFullscreen,
    IconEnvelope,
    IconEmotionsAngry,
    IconEmotionsDisgusted,
    IconEmotionsFearful,
    IconEmotionsHappy,
    IconEmotionsNeutral,
    IconEmotionsSad,
    IconEmotionsSurprised,
    IconExclamationSolid,
    IconExclamationTriangle,
    IconExitFullscreen,
    IconFaceSmile,
    IconFavorite,
    IconFavoriteSolid,
    IconFeedback,
    IconGear,
    IconGoogle,
    IconHangup,
    IconHelp,
    IconHighlight,
    IconImage,
    IconInfo,
    IconInfoCircle,
    IconMessage,
    IconMeter,
    IconMic,
    IconMicSlash,
    IconModerator,
    IconNoiseSuppressionOff,
    IconNoiseSuppressionOn,
    IconArrowRight,
    IconOffice365,
    IconPerformance,
    IconPhoneRinging,
    IconPin,
    IconPinned,
    IconPlay,
    IconPlus,
    IconRaiseHand,
    IconRecord,
    IconRecordAccount,
    IconRecordContact,
    IconRecordLead,
    IconRecordOpportunity,
    IconRemoteControlStart,
    IconRemoteControlStop,
    IconReply,
    IconRestore,
    IconRingGroup,
    IconScreenshare,
    IconSearch,
    IconSecurityOff,
    IconSecurityOn,
    IconSend,
    IconShare,
    IconShareDoc,
    IconShortcuts,
    IconSip,
    IconSites,
    IconStop,
    IconSubtitles,
    IconTileView,
    IconTrash,
    IconUserDeleted,
    IconUsers,
    IconUser,
    IconVideo,
    IconVideoOff,
    IconVolumeOff,
    IconVolumeUp,
    IconWarning,
    IconWarningCircle,
    IconWhiteboard,
    IconWhiteboardHide,
    IconWifi1Bar,
    IconWifi2Bars,
    IconWifi3Bars,
    IconYahoo
};
