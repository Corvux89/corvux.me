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
            'https://use.fontawesome.com'
        ],
        'script-src': [
            '\'self\'',
            'https://cdn.jsdelivr.net/',
            'https://www.googletagmanager.com/',
            'https://ajax.googleapis.com'
        ],
        'img-src': [
            '*',
            'data:'
        ],
        'style-src': [
            '\'self\'',
            'https://use.fontawesome.com',
            'https://cdn.jsdelivr.net/',
        ]
    }

    return csp
