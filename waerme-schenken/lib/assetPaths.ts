// Shared map: asset ID → base path on disk (relative to public/, no extension)
// Extension is resolved at runtime (.svg first, then .png, then .jpg)
export const ASSET_BASE_PATHS: Record<string, string> = {
    'logo':                 'images/logo',
    'ill-helicopter':       'images/helicopter',
    'ill-teddy':            'images/teddy',
    'ill-gift':             'images/gift',
    'ill-gift-dashboard':   'images/gift-dashboard',
    'ill-duck':             'images/duck',
    'ill-car':              'images/car',
    'ill-zebracat':         'images/zebracat',
    'icon-status-waiting':  'images/icon-status-waiting',
    'icon-status-approved': 'images/icon-status-approved',
    'icon-status-selected': 'images/icon-status-selected',
    'icon-status-sent':     'images/icon-status-sent',
    'icon-status-rejected': 'images/icon-status-rejected',
    'icon-selected-action': 'images/icon-selected-action',
    'icon-profile-edit':    'images/icon-profile-edit',
    'split-photo':          'images/split-photo',
    'favicon':              'favicon',
    'icon192':              'icons/icon-192x192',
    'icon512':              'icons/icon-512x512',
    'apple-icon':           'icons/apple-touch-icon',
};

// The original extension each asset was designed with (used as default when saving)
export const ASSET_DEFAULT_EXT: Record<string, string> = {
    'split-photo': '.jpg',
    'favicon':     '.png',
    'icon192':     '.png',
    'icon512':     '.png',
    'apple-icon':  '.png',
};

/** Ordered list of extensions to try when resolving an asset file */
export const RESOLVE_ORDER = ['.svg', '.png', '.jpg', '.jpeg'] as const;
