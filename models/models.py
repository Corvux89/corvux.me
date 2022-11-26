from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class Character(db.Model):
    __tablename__ = 'characters'

    key = db.Column(db.String, primary_key=True)
    name = db.Column(db.String)
    subtitle = db.Column(db.String)
    url = db.Column(db.String)
    image = db.Column(db.String)
    figcaption = db.Column(db.String)
    page = db.Column(db.Integer)
    order = db.Column(db.Integer)
    pass

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
