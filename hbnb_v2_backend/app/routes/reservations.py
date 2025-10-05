# app/routes/reservations.py
from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask import request
from app.facades.reservation_facade import ReservationFacade

api = Namespace('reservations', description='Endpoints related to reservations')

# ✅ Modèle d’entrée (ce que le frontend envoie)
reservation_input = api.model('ReservationInput', {
    'place_id': fields.Integer(required=True, description="ID du lieu à réserver"),
    'start_datetime': fields.String(required=True, description="Format: YYYY-MM-DDTHH:MM:SS"),
    'end_datetime': fields.String(required=True, description="Format: YYYY-MM-DDTHH:MM:SS")
})

# ✅ Modèle de sortie (ce que l’API renvoie)
reservation_output = api.inherit('ReservationOutput', reservation_input, {
    'id': fields.Integer(readOnly=True),
    'user_id': fields.Integer(readOnly=True),
})


@api.route('/')
class ReservationList(Resource):
    @api.marshal_list_with(reservation_output)
    def get(self):
        """List all reservations"""
        return ReservationFacade.get_all_reservations()

    @api.expect(reservation_input, validate=True)
    @api.marshal_with(reservation_output, code=201)
    @jwt_required()
    def post(self):
        """Create a new reservation"""
        data = request.get_json()
        user_id = get_jwt_identity()

        try:
            reservation = ReservationFacade.create_reservation(
                user_id=user_id,
                place_id=data['place_id'],
                start_datetime=data['start_datetime'],
                end_datetime=data['end_datetime']
            )
            return reservation, 201
        except ValueError as e:
            api.abort(400, str(e))


@api.route('/<int:id>')
@api.response(404, 'Reservation not found')
class ReservationDetail(Resource):
    @api.marshal_with(reservation_output)
    def get(self, id):
        """Get reservation by ID"""
        reservation = ReservationFacade.get_reservation_by_id(id)
        if not reservation:
            api.abort(404, "Reservation not found")
        return reservation

    @api.response(204, 'Reservation deleted')
    def delete(self, id):
        """Delete a reservation"""
        deleted = ReservationFacade.delete_reservation(id)
        if not deleted:
            api.abort(404, "Reservation not found")
        return '', 204

    @api.expect(reservation_input)
    @api.marshal_with(reservation_output)
    def put(self, id):
        """Update a reservation"""
        data = request.get_json()
        reservation = ReservationFacade.update_reservation(id, **data)
        if not reservation:
            api.abort(404, "Reservation not found or update failed")

        # Vérification logique métier côté façade
        if reservation.end_datetime <= reservation.start_datetime:
            api.abort(400, "End datetime must be after start datetime")

        return reservation


@api.route('/place/<int:place_id>')
class ReservationByPlace(Resource):
    @api.marshal_list_with(reservation_output)
    def get(self, place_id):
        """Get reservations by place ID"""
        reservations = ReservationFacade.get_reservations_by_place(place_id)
        return reservations or []  # ✅ on renvoie [] au lieu de 404


@api.route('/user/<int:user_id>')
class ReservationByUser(Resource):
    @api.marshal_list_with(reservation_output)
    def get(self, user_id):
        """Get reservations by user ID"""
        reservations = ReservationFacade.get_reservations_by_user(user_id)
        return reservations or []
