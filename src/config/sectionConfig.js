import { SECTION_TITLES, VIEW_TITLES } from '../utils/sectionTitleUtils';

const sectionConfig = {
  dashboard: {
    key: 'dashboard',
    title: SECTION_TITLES.dashboard,
    views: {
      overview: {
        key: 'overview',
        title: VIEW_TITLES.overview,
      },
      analytics: {
        key: 'analytics',
        title: VIEW_TITLES.analytics,
      }
    }
  },
  inventory: {
    key: 'inventory',
    title: SECTION_TITLES.inventory,
    views: {
      products: {
        key: 'products',
        title: VIEW_TITLES.products,
      },
      categories: {
        key: 'categories',
        title: VIEW_TITLES.categories,
      }
    }
  },
  orders: {
    key: 'orders',
    title: SECTION_TITLES.orders,
    views: {
      active: {
        key: 'active',
        title: VIEW_TITLES.active,
      },
      history: {
        key: 'history',
        title: VIEW_TITLES.history,
      }
    }
  },
  settings: {
    key: 'settings',
    title: SECTION_TITLES.settings,
    views: {
      profile: {
        key: 'profile',
        title: VIEW_TITLES.profile,
      },
      preferences: {
        key: 'preferences',
        title: VIEW_TITLES.preferences,
      }
    }
  }
};

export default sectionConfig; 