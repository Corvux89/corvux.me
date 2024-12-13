def get_csp():
    csp = {
        'default-src': [
            '\'self\'',
            'https://docs.google.com',
            'https://code.jquery.com/'
            'https://cdn.jsdelivr.net/npm/',
            'https://www.googletagmanager.com/',
            'https://analytics.google.com/',
            'https://www.google-analytics.com/',
            'https://use.fontawesome.com',
            'https://otfbm.io/'
        ],
        'script-src': [
            '\'self\'',
            'https://cdn.jsdelivr.net/',
            'https://www.googletagmanager.com/',
            'https://ajax.googleapis.com',
            'https://cdn.datatables.net/'
        ],
        'img-src': [
            '*',
            '\'self\'',
            'data:'
        ],
        'style-src': [
            '\'self\'',
            'https://use.fontawesome.com',
            'https://cdn.jsdelivr.net/',
            'https://cdn.datatables.net/'
        ],
        'font-src': [
            '\'self\'',
            'https://use.fontawesome.com'
        ]
    }

    return csp
