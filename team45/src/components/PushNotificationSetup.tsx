import { usePushNotifications } from '../hooks/usePushNotifications';

interface PushNotificationSetupProps {
    userId: string;
    vapidPublicKey: string;
}

export const PushNotificationSetup: React.FC<PushNotificationSetupProps> = ({ userId, 
    vapidPublicKey}) => {
    const {
        isSupported,
        permission,
        isSubscribed,
        isLoading,
        error,
        requestPermission,
        subscribeToPush,
        unsubscribe,
        clearError,
        canSubscribe,
        needsPermission,
        permissionDenied
    } = usePushNotifications({
        vapidPublicKey:vapidPublicKey,
        userId: userId,
        autoSubscribe: true
    });

    if (!isSupported) {
        return (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800">Push notifications are not supported in your browser.</p>
            </div>
        );
    }

    if (permissionDenied) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">
                    Push notifications are blocked. Please enable them in your browser settings.
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">{error}</p>
                <button 
                    onClick={clearError}
                    className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm"
                >
                    Dismiss
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-blue-800 font-medium">Push Notifications</p>
                    <p className="text-blue-600 text-sm">
                        {isSubscribed 
                            ? 'You will receive notifications for fraud case updates.'
                            : 'Get notified when fraud cases are resolved.'
                        }
                    </p>
                </div>
                
                {needsPermission && (
                    <button
                        onClick={requestPermission}
                        disabled={isLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
                    >
                        {isLoading ? 'Loading...' : 'Enable Notifications'}
                    </button>
                )}
                
                {canSubscribe && permission === 'granted' && (
                    <button
                        onClick={subscribeToPush}
                        disabled={isLoading}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-300"
                    >
                        {isLoading ? 'Subscribing...' : 'Subscribe'}
                    </button>
                )}
                
                {isSubscribed && (
                    <button
                        onClick={unsubscribe}
                        disabled={isLoading}
                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:bg-gray-300"
                    >
                        {isLoading ? 'Unsubscribing...' : 'Unsubscribe'}
                    </button>
                )}
            </div>
        </div>
    );
};