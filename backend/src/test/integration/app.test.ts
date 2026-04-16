import request from 'supertest'
import server, { connectDB } from '../../server'
import { AuthController } from '../../controllers/AuthController'

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
        expect(response.body.erros[0].msg).toBe('Email no válido"')

        expect(loginMock).not.toHaveBeenCalled()

    })
})