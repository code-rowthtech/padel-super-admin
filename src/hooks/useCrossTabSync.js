import { useEffect } from 'react';

export const useCrossTabSync = (channelName, onMessage) => {
  useEffect(() => {
    const channel = new BroadcastChannel(channelName);
    
    channel.onmessage = (event) => {
      onMessage(event.data);
    };

    return () => channel.close();
  }, [channelName, onMessage]);

  const broadcast = (data) => {
    const channel = new BroadcastChannel(channelName);
    channel.postMessage(data);
    channel.close();
  };

  return { broadcast };
};
