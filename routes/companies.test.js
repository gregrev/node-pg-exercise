process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

let testCompany;
let testInvoice;

// ** SET UP test db's

beforeEach(async () => {
    const comp_res = await db.query(`INSERT INTO companies (code, name, description) VALUES ('tsla', 'Tesla', 'Elon Musk.') RETURNING  code, name, description`);
    testCompany = comp_res.rows[0]

    const inv_res = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ('tsla', 500) RETURNING  id, comp_code, amt`);
    testInvoice = inv_res.rows[0]
})

afterEach(async () => {
    await db.query(`DELETE FROM companies`)
    await db.query(`DELETE FROM invoices`)
})

afterAll(async () => {
    await db.end()
})

// ** TESTS

describe('GET /companies/:code', () => {
    test('Gets a single company by ID', async () => {
        const res = await request(app).get(`/companies/${testCompany.code}`)
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            company: {
                ...testCompany,
                invoices: [
                    {
                        id: expect.any(Number),
                        comp_code: "tsla",
                        amt: 500,
                        paid: false,
                        add_date: expect.anything(),
                        paid_date: null
                    }
                ]
            }
        })
    })
})

describe('POST /companies', () => {
    test("Creates one company", async () => {
        const res = await request(app).post('/companies').send({ code: 'mcds', name: 'McDonalds', description: 'Have it your way.' });
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({
            company: { code: 'mcds', name: 'McDonalds', description: 'Have it your way.' }
        })
    })
})

describe('DELETE /companies/:code', () => {
    test("Deletes one company", async () => {
        const res = await request(app).delete(`/companies/${testCompany.code}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ msg: "Deleted" })
    })
})



