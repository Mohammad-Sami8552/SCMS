const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticate = require('../middleware/auth');

router.use(authenticate);

router.get('/stores', adminController.getStores);
router.post('/stores', adminController.addStore);

router.get('/employees', adminController.getEmployees);
router.post('/employees', adminController.addEmployee);

router.get('/materials', adminController.getMaterials);
router.post('/materials', adminController.addMaterial);

router.get('/suppliers', adminController.getSuppliers);
router.post('/suppliers', adminController.addSupplier);

router.get('/manufacturers', adminController.getManufacturers);
router.post('/manufacturers', adminController.addManufacturer);

module.exports = router;