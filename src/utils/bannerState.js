const BANNER_STATE_KEY = 'mobileBannerHidden';

export const getBannerState = () => {
  return sessionStorage.getItem(BANNER_STATE_KEY) !== 'true';
};

export const hideBanner = () => {
  sessionStorage.setItem(BANNER_STATE_KEY, 'true');
};

export const showBanner = () => {
  sessionStorage.removeItem(BANNER_STATE_KEY);
};