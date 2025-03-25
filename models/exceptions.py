class AdminAccessError(Exception):
    def __init__(self, message="Access denied. Administrator access only."):
        self.message = message
        super().__init__(self.message)


class LoginError(Exception):
    def __init__(self, message="Access denied. You must be logged in to view this"):
        self.message = message
        super().__init__(self.message)


class BadRequest(Exception):
    def __init__(self, message="Bad Request"):
        self.message = message
        super().__init__(self.message)


class NotFound(Exception):
    def __init__(self, message="URL not found"):
        self.message = message
        super().__init__(self.message)
