class AdminAccessError(Exception):
    def __init__(self, message="Access denied. Administrator access only."):
        self.message = message
        super().__init__(self.message)

class LoginError(Exception):
    def __init__(self, message="Access denied. You must be logged in to view this"):
        self.message = message
        super().__init__(self.message)