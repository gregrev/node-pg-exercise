const express = require('express')
const ExpressError = require('../expressError')
const router = express.Router();
const db = require('../db')

router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(`SELECT * FROM invoices`);
        return res.json({ invoices: results.rows })
    } catch (e) {
        // console.error(e)
        next(e)
    }
})

router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        // use Parameterized Queries
        const results = await db.query(`SELECT * FROM invoices WHERE id = $1`, [id])
        if (results.rows.length === 0) {
            throw new ExpressError(`Can't find invoice with id of ${id}`, 404)
        }
        return res.json({ invoice: results.rows[0] })
    } catch (e) {
        next(e)
    }
})

router.post('/', async (req, res, next) => {
    try {
        // deconstruct and get the code, name, values from req.body
        const { comp_code, amt } = req.body;
        // INSERT INTO db with sql query and use Parameterized Queries 1$, $2...
        const results = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date`, [comp_code, amt])
        return res.status(201).json({ new_invoice: results.rows[0] })
    } catch (e) {
        next(e)
    }
})

router.put('/:id', async (req, res, next) => {
    try {
        // deconstruct and get the code, name, values from req.body
        const { id } = req.params
        const { amt, paid, paid_date } = req.body;
        // Update db with sql query and use Parameterized Queries 1$, $2...
        const results = await db.query(`UPDATE invoices SET amt=$2, paid=$3, paid_date=$4 WHERE id=$1 RETURNING id, comp_code, amt, paid, add_date, paid_date`, [id, amt, paid, paid_date])
        if (results.rows.length === 0) {
            throw new ExpressError(`Invoice with id of ${id}, not found`, 404)
        }
        return res.status(201).json({ updated_invoice: results.rows[0] })
    } catch (e) {
        next(e)
    }
})

router.delete('/:id', async (req, res, next) => {
    try {
        const results = await db.query('DELETE FROM invoices WHERE id=$1', [req.params.id])
        return res.send({ msg: "Deleted" })
    } catch (e) {
        next(e)
    }
})



module.exports = router;