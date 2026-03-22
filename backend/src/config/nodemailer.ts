import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

type TransportConfig = {
    host: string,
    port: number,
    auth: {
        user: string
        pass: string
    }
}

const config = () : TransportConfig => {
    return {
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '587'),
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    }
}

export const transport = nodemailer.createTransport(config());