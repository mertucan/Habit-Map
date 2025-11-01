from .extensions import db, bcrypt
from datetime import datetime

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    habits = db.relationship('Habit', backref='owner', lazy=True, cascade="all, delete-orphan")

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f'<User {self.username}>'

class Habit(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    logs = db.relationship('HabitLog', backref='habit', lazy=True, cascade="all, delete-orphan")

    def __repr__(self):
        return f'<Habit {self.name}>'

class HabitLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date_completed = db.Column(db.Date, nullable=False, default=datetime.utcnow)
    habit_id = db.Column(db.Integer, db.ForeignKey('habit.id'), nullable=False)
    __table_args__ = (db.UniqueConstraint('habit_id', 'date_completed', name='_habit_date_uc'),)

    def __repr__(self):
        return f'<HabitLog {self.habit.name} on {self.date_completed}>'