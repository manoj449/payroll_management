const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payrollController');

router.post('/', payrollController.addPayroll);
router.get('/all', payrollController.getAllPayrolls);
router.get('/:id', payrollController.getPayrollById);
router.put('/:id', payrollController.updatePayroll);
router.delete('/:id', payrollController.deletePayroll);

module.exports = router;