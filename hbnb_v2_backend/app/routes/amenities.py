from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.facades.amenity_facade import AmenityFacade

api = Namespace('amenities', description='Endpoints related to amenities and their association with places')

amenity_model = api.model('Amenity', {
    'id': fields.Integer(readOnly=True),
    'name': fields.String(required=True, description='Amenity name'),
    'owner_id': fields.Integer(readOnly=True, description='Owner user ID')
})

amenity_link_model = api.model('AmenityLink', {
    'amenity_id': fields.Integer(required=True, description='ID of the amenity to link')
})


@api.route('/')
class AmenityList(Resource):
    @jwt_required()
    @api.marshal_list_with(amenity_model)
    def get(self):
        """List all amenities owned by the current user"""
        user_id = get_jwt_identity()
        return AmenityFacade.get_all_amenities_by_owner(user_id)

    @jwt_required()
    @api.expect(amenity_model)
    @api.marshal_with(amenity_model, code=201)
    def post(self):
        """Create a new amenity for the current user"""
        user_id = get_jwt_identity()
        name = api.payload.get('name')
        if not name:
            api.abort(400, "Amenity name is required")
        return AmenityFacade.create_amenity(name, user_id), 201


@api.route('/<int:id>')
@api.response(404, 'Amenity not found')
class AmenityDetail(Resource):
    @jwt_required()
    @api.marshal_with(amenity_model)
    def get(self, id):
        """Retrieve an amenity by ID if owned by the user"""
        user_id = get_jwt_identity()
        amenity = AmenityFacade.get_amenity_by_id_and_owner(id, user_id)
        if not amenity:
            api.abort(404, "Amenity not found or not owned by you")
        return amenity

    @jwt_required()
    @api.expect(amenity_model)
    @api.marshal_with(amenity_model)
    def put(self, id):
        """Update an amenity by ID if owned by the user"""
        user_id = get_jwt_identity()
        amenity = AmenityFacade.get_amenity_by_id_and_owner(id, user_id)
        if not amenity:
            api.abort(404, "Amenity not found or not owned by you")

        name = api.payload.get('name')
        if not name:
            api.abort(400, "Amenity name is required")

        return AmenityFacade.update_amenity(amenity, name)

    @jwt_required()
    @api.response(204, 'Amenity deleted')
    def delete(self, id):
        """Delete an amenity by ID if owned by the user"""
        user_id = get_jwt_identity()
        amenity = AmenityFacade.get_amenity_by_id_and_owner(id, user_id)
        if not amenity:
            api.abort(404, "Amenity not found or not owned by you")
        AmenityFacade.delete_amenity(amenity)
        return '', 204


@api.route('/places/<int:place_id>/amenities')
@api.doc(params={'place_id': 'ID of the place'})
class PlaceAmenities(Resource):
    @jwt_required()
    @api.marshal_list_with(amenity_model)
    def get(self, place_id):
        """Get all amenities linked to a given place"""
        amenities = AmenityFacade.get_amenities_by_place_id(place_id)
        if amenities is None:
            api.abort(404, "Place not found")
        return amenities

    @jwt_required()
    @api.expect(amenity_link_model)
    def post(self, place_id):
        """Link an existing amenity to a place"""
        user_id = get_jwt_identity()
        amenity_id = api.payload.get('amenity_id')
        if not amenity_id:
            return {'message': 'amenity_id is required'}, 400

        amenity, error = AmenityFacade.link_amenity_to_place(amenity_id, place_id, user_id)
        if error:
            return {'message': error}, 404 if 'not found' in error else 409
        return {'message': 'Amenity linked successfully'}, 201
