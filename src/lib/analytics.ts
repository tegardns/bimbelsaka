import ReactGA from "react-ga4";

const GA_MEASUREMENT_ID = "G-4F0TWX87LG";

export const initGA = () => {
  ReactGA.initialize(GA_MEASUREMENT_ID);
};

export const trackPageView = (path: string) => {
  ReactGA.send({
    hitType: "pageview",
    page: path,
  });
};

export const trackEvent = (
  action: string,
  category: string,
  label?: string,
) => {
  ReactGA.event({
    action,
    category,
    label,
  });
};
