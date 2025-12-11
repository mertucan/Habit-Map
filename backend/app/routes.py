from flask import Blueprint, request, jsonify, session
from app import db
from app.models import User, Habit, HabitLog
from app.habit_logic import format_heatmap_data
from datetime import datetime, date
import sqlalchemy
import re

bp = Blueprint('main', __name__)

# Kimlik Doğrulama Rotaları

@bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')

        if not username or not email or not password:
            return jsonify({'error': 'Missing fields'}), 400

        # Regex kullanarak e-posta doğrulama
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_regex, email):
             return jsonify({'error': 'Invalid email format'}), 400

        if User.query.filter_by(username=username).first():
            return jsonify({'error': 'Username already exists'}), 409
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'Email already exists'}), 409

        user = User(username=username, email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()

        return jsonify({'message': 'User registered successfully'}), 201

    except Exception as e:
        print(f"Error in register: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username_or_email = data.get('username') # Frontend her ikisi için de bu alanı gönderir
        password = data.get('password')

        user = User.query.filter(
            (User.username == username_or_email) | (User.email == username_or_email)
        ).first()

        if user and user.check_password(password):
            session['user_id'] = user.id
            return jsonify({'message': 'Login successful', 'user': user.to_dict()}), 200
        else:
            return jsonify({'error': 'Invalid username/email or password'}), 401

    except Exception as e:
        print(f"Error in login: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@bp.route('/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({'message': 'Logged out'}), 200

# Oturumdan geçerli kullanıcı ID'sini almak için yardımcı fonksiyon
def get_current_user_id():
    return session.get('user_id')

# Alışkanlıklar için Rotalar

@bp.route('/habits', methods=['GET'])
def get_habits():
    try:
        user_id = get_current_user_id()
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401
        
        # Alışkanlıkları getir
        habits = Habit.query.filter_by(user_id=user_id).all()
        habits_data = []

        # Bu kullanıcı için tüm kayıtları tek seferde getir
        logs = HabitLog.query.join(Habit).filter(Habit.user_id == user_id).all()
        
        # Kayıtları habit_id'ye göre grupla
        logs_by_habit = {}
        for log in logs:
            if log.habit_id not in logs_by_habit:
                logs_by_habit[log.habit_id] = []
            logs_by_habit[log.habit_id].append(log)

        for habit in habits:
            habit_dict = habit.to_dict()
            # Isı haritası verilerini doğrudan alışkanlık nesnesine ekle
            habit_logs = logs_by_habit.get(habit.id, [])
            habit_dict['heatmap'] = format_heatmap_data(habit_logs)
            habits_data.append(habit_dict)

        return jsonify(habits_data), 200
    except Exception as e:
        print(f"Error in get_habits: {e}")
        return jsonify({'error': str(e)}), 500

@bp.route('/habits', methods=['POST'])
def create_habit():
    try:
        user_id = get_current_user_id()
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401

        data = request.get_json()
        name = data.get('name')
        description = data.get('description', '')

        if not name:
            return jsonify({'error': 'Name is required'}), 400

        habit = Habit(name=name, description=description, user_id=user_id)
        db.session.add(habit)
        db.session.commit()

        habit_dict = habit.to_dict()
        habit_dict['heatmap'] = {} # Yeni alışkanlık için boş ısı haritası
        return jsonify(habit_dict), 201
    except Exception as e:
        print(f"Error in create_habit: {e}")
        return jsonify({'error': str(e)}), 500

@bp.route('/habits/<int:habit_id>', methods=['GET'])
def get_habit(habit_id):
    try:
        user_id = get_current_user_id()
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401

        habit = Habit.query.filter_by(id=habit_id, user_id=user_id).first()
        if not habit:
            return jsonify({'error': 'Habit not found'}), 404

        return jsonify(habit.to_dict()), 200
    except Exception as e:
        print(f"Error in get_habit: {e}")
        return jsonify({'error': str(e)}), 500

@bp.route('/habits/<int:habit_id>', methods=['PUT'])
def update_habit(habit_id):
    try:
        user_id = get_current_user_id()
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401

        habit = Habit.query.filter_by(id=habit_id, user_id=user_id).first()
        if not habit:
            return jsonify({'error': 'Habit not found'}), 404

        data = request.get_json()
        habit.name = data.get('name', habit.name)
        habit.description = data.get('description', habit.description)
        
        db.session.commit()
        return jsonify(habit.to_dict()), 200
    except Exception as e:
        print(f"Error in update_habit: {e}")
        return jsonify({'error': str(e)}), 500

@bp.route('/habits/<int:habit_id>', methods=['DELETE'])
def delete_habit(habit_id):
    try:
        user_id = get_current_user_id()
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401

        habit = Habit.query.filter_by(id=habit_id, user_id=user_id).first()
        if not habit:
            return jsonify({'error': 'Habit not found'}), 404

        db.session.delete(habit)
        db.session.commit()
        return jsonify({'message': 'Habit deleted'}), 200
    except Exception as e:
        print(f"Error in delete_habit: {e}")
        return jsonify({'error': str(e)}), 500

# Alışkanlık Günlükleri / Isı Haritası Rotaları

@bp.route('/habits/<int:habit_id>/logs', methods=['POST'])
def add_habit_log(habit_id):
    try:
        user_id = get_current_user_id()
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401
        
        habit = Habit.query.filter_by(id=habit_id, user_id=user_id).first()
        if not habit:
            return jsonify({'error': 'Habit not found'}), 404

        data = request.get_json()
        date_str = data.get('date') # Format YYYY-AA-GG
        
        if date_str:
            try:
                log_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
        else:
            log_date = date.today()

        # Bu tarih için zaten kaydedilmiş mi kontrol et
        existing_log = HabitLog.query.filter_by(habit_id=habit_id, completion_date=log_date).first()
        if existing_log:
             # Eğer varsa, tamamlanmış demektir. Kullanıcı bunu kapatmak (işareti kaldırmak) istiyor.
             # Bu yüzden kaydı siliyoruz.
             db.session.delete(existing_log)
             db.session.commit()
             # Silinme durumunu döndür (null veya özel mesaj)
             return jsonify({'message': 'Log deleted (unchecked)', 'completed': False}), 200
        
        # Eğer yoksa, oluştur (varsayılan olarak completed=True veya sadece varlık)
        log = HabitLog(habit_id=habit_id, completed=True, completion_date=log_date)
        db.session.add(log)
        db.session.commit()
        
        return jsonify(log.to_dict()), 201

    except Exception as e:
        print(f"Error in add_habit_log: {e}")
        return jsonify({'error': str(e)}), 500

@bp.route('/habits/<int:habit_id>/heatmap', methods=['GET'])
def get_habit_heatmap(habit_id):
    try:
        user_id = get_current_user_id()
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401

        habit = Habit.query.filter_by(id=habit_id, user_id=user_id).first()
        if not habit:
            return jsonify({'error': 'Habit not found'}), 404

        # Sadece var olan kayıtları getir (tamamlandığını ima eder)
        logs = HabitLog.query.filter_by(habit_id=habit_id).all()
        heatmap_data = format_heatmap_data(logs)
        
        return jsonify(heatmap_data), 200
    except Exception as e:
        print(f"Error in get_habit_heatmap: {e}")
        return jsonify({'error': str(e)}), 500

@bp.route('/stats', methods=['GET'])
def get_stats():
    try:
        user_id = get_current_user_id()
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401

        total_habits = Habit.query.filter_by(user_id=user_id).count()

        # Kullanıcı için tüm benzersiz tamamlanma tarihlerini getir
        logs = db.session.query(HabitLog.completion_date).join(Habit).filter(
            Habit.user_id == user_id
        ).distinct().order_by(HabitLog.completion_date.desc()).all()

        dates = [log.completion_date for log in logs]
        
        current_streak = 0
        best_streak = 0
        
        if dates:
            # Calculate Current Streak
            today = date.today()
            last_date = dates[0]
            
            # Son kayıt bugün veya dün ise, seri potansiyel olarak devam ediyor
            diff = (today - last_date).days
            
            if diff <= 1:
                current_streak = 1
                for i in range(len(dates) - 1):
                    delta = (dates[i] - dates[i+1]).days
                    if delta == 1:
                        current_streak += 1
                    else:
                        break
            
            # Calculate Best Streak
            temp_streak = 1
            best_streak = 1
            for i in range(len(dates) - 1):
                delta = (dates[i] - dates[i+1]).days
                if delta == 1:
                    temp_streak += 1
                else:
                    best_streak = max(best_streak, temp_streak)
                    temp_streak = 1
            best_streak = max(best_streak, temp_streak)

        return jsonify({
            'total_habits': total_habits,
            'current_streak': current_streak,
            'best_streak': best_streak
        }), 200
    except Exception as e:
        print(f"Error in get_stats: {e}")
        return jsonify({'error': str(e)}), 500

@bp.route('/reports', methods=['GET'])
def get_reports():
    try:
        user_id = get_current_user_id()
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401

        total_habits = Habit.query.filter_by(user_id=user_id).count()

        # Serileri ve ısı haritasını hesaplamak için kullanıcının tüm kayıtlarını getir
        logs = db.session.query(HabitLog).join(Habit).filter(
            Habit.user_id == user_id
        ).all()

        # Isı Haritası Veri Toplama
        heatmap_data = {}
        unique_dates = set()
        
        for log in logs:
            date_str = log.completion_date.isoformat()
            heatmap_data[date_str] = heatmap_data.get(date_str, 0) + 1
            unique_dates.add(log.completion_date)

        # Seri hesaplaması için tarihleri sırala
        dates = sorted(list(unique_dates), reverse=True)
        
        current_streak = 0
        best_streak = 0
        
        if dates:
            # Calculate Current Streak
            today = date.today()
            last_date = dates[0]
            
            diff = (today - last_date).days
            if diff <= 1:
                current_streak = 1
                for i in range(len(dates) - 1):
                    delta = (dates[i] - dates[i+1]).days
                    if delta == 1:
                        current_streak += 1
                    else:
                        break
            
            # Calculate Best Streak
            temp_streak = 1
            best_streak = 1
            for i in range(len(dates) - 1):
                delta = (dates[i] - dates[i+1]).days
                if delta == 1:
                    temp_streak += 1
                else:
                    best_streak = max(best_streak, temp_streak)
                    temp_streak = 1
            best_streak = max(best_streak, temp_streak)

        return jsonify({
            'stats': {
                'total_habits': total_habits,
                'current_streak': current_streak,
                'best_streak': best_streak
            },
            'heatmap': heatmap_data
        }), 200
    except Exception as e:
        print(f"Error in get_reports: {e}")
        return jsonify({'error': str(e)}), 500
