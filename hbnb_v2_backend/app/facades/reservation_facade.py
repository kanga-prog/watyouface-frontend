from datetime import datetime

from app.models import Reservation
from app.extensions import db


class ReservationFacade:
    @staticmethod
    def create_reservation(user_id, place_id, start_datetime, end_datetime):
        try:
            start_dt = datetime.strptime(start_datetime, "%Y-%m-%dT%H:%M:%S")
            end_dt = datetime.strptime(end_datetime, "%Y-%m-%dT%H:%M:%S")
        except ValueError:
            raise ValueError("Datetime format must be YYYY-MM-DDTHH:MM:SS")

        if start_dt >= end_dt:
            raise ValueError("End datetime must be after start datetime")

        # Vérifie les réservations qui se chevauchent
        overlapping = Reservation.query.filter(
            Reservation.place_id == place_id,
            Reservation.start_datetime < end_dt,
            Reservation.end_datetime > start_dt
        ).first()

        if overlapping:
            raise ValueError("This place is already reserved during the selected period.")

        reservation = Reservation(
            user_id=user_id,
            place_id=place_id,
            start_datetime=start_dt,
            end_datetime=end_dt
        )
        db.session.add(reservation)
        db.session.commit()
        return reservation

    @staticmethod
    def get_reservations_by_user(user_id):
        return Reservation.query.filter_by(user_id=user_id).all()

    @staticmethod
    def get_reservations_by_place(place_id):
        return Reservation.query.filter_by(place_id=place_id).all()

    @staticmethod
    def get_all_reservations():
        return Reservation.query.all()

    @staticmethod
    def get_reservation_by_id(reservation_id):
        return Reservation.query.get(reservation_id)

    @staticmethod
    def update_reservation(reservation_id, **kwargs):
        reservation = Reservation.query.get(reservation_id)
        if not reservation:
            return None

        for key, value in kwargs.items():
            if hasattr(reservation, key):
                if key in ['start_datetime', 'end_datetime']:
                    # Parse date if passed as string
                    if isinstance(value, str):
                        try:
                            value = datetime.strptime(value, "%Y-%m-%dT%H:%M:%S")
                        except ValueError:
                            raise ValueError("Datetime format must be YYYY-MM-DDTHH:MM:SS")
                setattr(reservation, key, value)

        # Revalidation possible des dates pour éviter incohérences après modif
        if reservation.start_datetime >= reservation.end_datetime:
            raise ValueError("End datetime must be after start datetime")

        # Vérifie que la modification ne crée pas de chevauchement
        overlapping = Reservation.query.filter(
            Reservation.place_id == reservation.place_id,
            Reservation.id != reservation_id,
            Reservation.start_datetime < reservation.end_datetime,
            Reservation.end_datetime > reservation.start_datetime
        ).first()

        if overlapping:
            raise ValueError("Updated reservation conflicts with an existing reservation.")

        db.session.commit()
        return reservation

    @staticmethod
    def delete_reservation(reservation_id):
        reservation = Reservation.query.get(reservation_id)
        if reservation:
            db.session.delete(reservation)
            db.session.commit()
            return True
        return False
