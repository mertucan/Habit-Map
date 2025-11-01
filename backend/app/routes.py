# app/routes.py
from flask import Blueprint, request, jsonify
from .models import User
from .extensions import db, bcrypt
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

api_bp = Blueprint('api_bp', __name__)

@api_bp.route('/hello')
def hello():
    return jsonify(message="Merhaba, API Blueprint çalışıyor!")

@api_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify(message="Eksik bilgi girdiniz"), 400

    if User.query.filter_by(email=email).first() or User.query.filter_by(username=username).first():
        return jsonify(message="Bu e-posta veya kullanıcı adı zaten mevcut"), 409

    new_user = User(username=username, email=email)
    new_user.set_password(password)
    
    db.session.add(new_user)
    db.session.commit()

    return jsonify(message="Kullanıcı başarıyla oluşturuldu"), 201

@api_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify(message="Eksik bilgi girdiniz"), 400

    user = User.query.filter_by(email=email).first()

    if user and user.check_password(password):
        access_token = create_access_token(identity=user.id)
        return jsonify(access_token=access_token, user_id=user.id, username=user.username), 200
    else:
        return jsonify(message="Geçersiz e-posta veya parola"), 401

@api_bp.route('/profile')
@jwt_required()
def profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user:
        return jsonify(message="Kullanıcı bulunamadı"), 404

    return jsonify(id=user.id, username=user.username, email=user.email), 200