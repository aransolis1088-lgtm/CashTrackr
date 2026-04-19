import request from 'supertest'
import server, { connectDB } from '../../server'
import { AuthController } from '../../controllers/AuthController'
import User from '../../models/User'
import * as authUtils from '../../utils/auth'
import * as jwtUtils from '../../utils/jwt'
import { check } from 'express-validator'

describe('Authentication - Create Account', () => {
    it('Should display validation errors when form is empty', async () => {
        const response = await request(server)
            .post('/api/auth/create-account')
            .send({})

        const createAccountMock = jest.spyOn(AuthController, 'createAccount')


        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors).toHaveLength(3)
        expect(response.status).not.toBe(201)
        expect(createAccountMock).not.toHaveBeenCalled()
    })

    it('Should return 400 status code when the email is invalid', async () => {
        const response = await request(server)
            .post('/api/auth/create-account')
            .send({
                "name": "Juan",
                "password": "12345678",
                "email": "not_valid_email"
            })

        const createAccountMock = jest.spyOn(AuthController, 'createAccount')


        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors).toHaveLength(1)
        expect(response.body.errors[0].msg).toBe('E-mail no válido')

        expect(response.status).not.toBe(201)
        expect(createAccountMock).not.toHaveBeenCalled()
    })

    it('Should return 400 status code when the password is less than 8 characters', async () => {
        const response = await request(server)
            .post('/api/auth/create-account')
            .send({
                "name": "Juan",
                "password": "short",
                "email": "test@test.com"
            })

        const createAccountMock = jest.spyOn(AuthController, 'createAccount')


        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors).toHaveLength(1)

        expect(response.body.errors[0].msg).toBe('El password es muy corto, mínimo 8 caracteres')
        expect(response.status).not.toBe(201)
        expect(createAccountMock).not.toHaveBeenCalled()
    })

    it('Should register a new user successfully', async () => {

        const userData = {
            "name": "Juan",
            "password": "password",
            "email": "test@test.com"
        }

        const response = await request(server)
            .post('/api/auth/create-account')
            .send(userData)

        expect(response.status).toBe(201)
        expect(response.body).not.toHaveProperty('errors')
        expect(response.status).not.toBe(400)
    })

    it('Should returned 409 status code when a user is already registered', async () => {

        const userData = {
            "name": "Juan",
            "password": "password",
            "email": "test@test.com"
        }

        const response = await request(server)
            .post('/api/auth/create-account')
            .send(userData)

        expect(response.status).toBe(409)
        expect(response.status).not.toBe(400)
        expect(response.status).not.toBe(201)
        expect(response.body).not.toHaveProperty('errors')
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe('Un usuario con ese email ya está registrado.')
    })
})

describe('Authentication - Account Confirmation with Token', () => {
    it('Should dispplay error if token is empty or token is not valid', async () => {
        const response = await request(server)
            .post('/api/auth/confirm-account')
            .send({
                token: 'not_valid'
            })

        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors).toHaveLength(1)
        expect(response.body.errors[0].msg).toBe('Token no válido')
    })

    it('Should dispplay error if token doesnt exists', async () => {
        const response = await request(server)
            .post('/api/auth/confirm-account')
            .send({
                token: '123456'
            })

        expect(response.status).toBe(401)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe('Token no válido')
        expect(response.status).not.toBe(200)
    })

    it('Should confirm account with a valid token', async () => {

        const token = globalThis.cashTrackrConfirmationToken
        const response = await request(server)
            .post('/api/auth/confirm-account')
            .send({ token })

        expect(response.status).toBe(200)
        expect(response.body).toEqual("Cuenta confirmada correctamente")
        expect(response.status).not.toBe(401)
    })
})


describe('Authentication - Login', () => {

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('Should display validation errors when the form is empty', async () => {
        const response = await request(server)
            .post('/api/auth/login/')
            .send({})

        const loginMock = jest.spyOn(AuthController, 'login')

        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors).toHaveLength(2)

        expect(loginMock).not.toHaveBeenCalled()
    })

    it('Should return 400 bad request when the email is invalid', async () => {
        const response = await request(server)
            .post('/api/auth/login/')
            .send({
                "password": "password",
                "email": "not_valid"
            })

        const loginMock = jest.spyOn(AuthController, 'login')

        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors).toHaveLength(1)
        expect(response.body.errors[0].msg).toBe('Email no válido')

        expect(loginMock).not.toHaveBeenCalled()

    })

    it('Should return a 400 error if the user is not found', async () => {
        const response = await request(server)
            .post('/api/auth/login/')
            .send({
                "password": "password",
                "email": "user_not_found@test.com"
            })


        expect(response.status).toBe(404)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe('Usuario No Encontrado')

    })

    it('Should return a 403 error if the user account is not confirmed', async () => {

        (jest.spyOn(User, 'findOne') as jest.Mock)
            .mockResolvedValue({
                id: 1,
                confirmed: false,
                password: "hashedPassword",
                email: "user_not_confirmed@test.com"
            })

        const response = await request(server)
            .post('/api/auth/login/')
            .send({
                "password": "password",
                "email": "user_not_confirmed@test.com"
            })


        expect(response.status).toBe(403)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe('La cuenta no ha sido confirmada')

        expect(response.status).not.toBe(200)
        expect(response.status).not.toBe(404)

    })

    it('Should return a 403 error if the user account is not confirmed', async () => {

        const userData = {
            name: "Test",
            password: "password",
            email: "user_not_confirmed@test.com"
        }

        await request(server)
            .post('/api/auth/create-account')
            .send(userData)

        const response = await request(server)
            .post('/api/auth/login/')
            .send({
                "password": userData.password,
                "email": userData.email
            })


        expect(response.status).toBe(403)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe('La cuenta no ha sido confirmada')

        expect(response.status).not.toBe(200)
        expect(response.status).not.toBe(404)

    })

    it('Should return a 401 error if the password is incorrect', async () => {

        const findOne = (jest.spyOn(User, 'findOne') as jest.Mock)
            .mockResolvedValue({
                id: 1,
                confirmed: true,
                password: "hashedPassword"
            })

        const checkPassword = jest.spyOn(authUtils, 'checkPassword').mockResolvedValue(false)

        const response = await request(server)
            .post('/api/auth/login/')
            .send({
                "password": "wrongPassword",
                "email": "test@test.com"
            })


        expect(response.status).toBe(401)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe('Password Incorrecto')

        expect(response.status).not.toBe(200)
        expect(response.status).not.toBe(404)
        expect(response.status).not.toBe(403)

        expect(findOne).toHaveBeenCalledTimes(1)
        expect(checkPassword).toHaveBeenCalledTimes(1)
    })

    it('Should return a 401 error if the password is incorrect', async () => {

        const findOne = (jest.spyOn(User, 'findOne') as jest.Mock)
            .mockResolvedValue({
                id: 1,
                confirmed: true,
                password: "hashedPassword"
            })

        const checkPassword = jest.spyOn(authUtils, 'checkPassword').mockResolvedValue(true)
        const generateJWT = jest.spyOn(jwtUtils, 'generateJWT').mockReturnValue('jwt_token')

        const response = await request(server)
            .post('/api/auth/login/')
            .send({
                "password": "correctPassword",
                "email": "test@test.com"
            })

        expect(response.status).toBe(200)
        expect(response.body).toEqual('jwt_token')
        expect(findOne).toHaveBeenCalled()
        expect(findOne).toHaveBeenCalledTimes(1)

        expect(checkPassword).toHaveBeenCalled()
        expect(checkPassword).toHaveBeenCalledTimes(1)
        expect(checkPassword).toHaveBeenCalledWith('correctPassword', 'hashedPassword')

        expect(generateJWT).toHaveBeenCalled()
        expect(generateJWT).toHaveBeenCalledTimes(1)
        expect(generateJWT).toHaveBeenCalledWith(500)
    })
})