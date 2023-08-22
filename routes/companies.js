const express = require('express')
const ExpressError = require('../expressError')
const router = express.Router();
const db = require('../db')
const slugify = require('slugify')

router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(`SELECT * FROM companies`);
        return res.json({ companies: results.rows })
    } catch (e) {
        // console.error(e)
        next(e)
    }
})

router.get('/:code', async (req, res, next) => {
    try {
        const { code } = req.params;
        // use Parameterized Queries
        const comp_res = await db.query(`SELECT * FROM companies WHERE code = $1`, [code])
        // console.log(comp_res)
        const inv_res = await db.query(`SELECT * FROM invoices WHERE comp_code = $1`, [code])
        // console.log(inv_res)

        if (comp_res.rows.length === 0) {
            throw new ExpressError(`Can't find company with code: ${code}`, 404)
        }
        return res.json({
            company: {
                // ** spread operator includes all properties from the comp_res.rows[0] obj instead of typing each line
                ...comp_res.rows[0],
                invoices: inv_res.rows.map(invoice => invoice)
            }
        })
    } catch (e) {
        next(e)
    }
})

router.post('/', async (req, res, next) => {
    try {
        // deconstruct and get the code, name, values from req.body
        const { name, description } = req.body;
        const code = slugify(name, {
            lower: true
        });
        // INSERT INTO db with sql query and use Parameterized Queries 1$, $2...
        const results = await db.query(`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description`, [code, name, description])
        return res.status(201).json({ company: results.rows[0] })
    } catch (e) {
        next(e)
    }
})

router.put('/:code', async (req, res, next) => {
    try {
        // deconstruct and get the code, name, values from req.body
        const { code } = req.params
        const { name, description } = req.body;
        const newCode = req.body.code
        // INSERT INTO db with sql query and use Parameterized Queries 1$, $2...
        const results = await db.query(`UPDATE companies SET code=$1, name=$3, description=$4 WHERE code=$2 RETURNING code, name, description`, [newCode, code, name, description,])
        if (results.rows.length === 0) {
            throw new ExpressError(`Can't update company code of ${code}, not found`, 404)
        }
        return res.status(201).json({ company: results.rows[0] })
    } catch (e) {
        next(e)
    }
})

router.delete('/:code', async (req, res, next) => {
    try {
        const results = await db.query('DELETE FROM companies WHERE code = $1', [req.params.code])
        return res.send({ msg: "Deleted" })
    } catch (e) {
        next(e)
    }
})



module.exports = router;