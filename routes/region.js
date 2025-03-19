const {Router} = require("express");
const Region = require("../model/region");
const { Op } = require("sequelize");
const joi = require("joi")

const route = Router()

route.get("/", async (req, res)=>{
    try {
        let limit = parseInt(req.query.limit) || 10
        let page = parseInt(req.query.page) || 1
        let offset = (page-1)*limit
        let name = req.query.name
        let where = {}
        if(name){
            where.name = {[Op.startsWith]: name}
        }
        let regions = await Region.findAll({where, limit, offset})
        if(!regions.length) return res.status(404).json({message: "no regions found"})
        res.json(regions)
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "server error"})
    }
})

let schema = joi.object({
    name: joi.string().min(2).max(55).required()
})

route.post("/", async (req, res)=>{
    try {
        let {name} = req.body
        let { error } = schema.validate({name})
        if(error) return res.status(400).json({ message: error.details[0].message })
        await Region.create({name})
        res.json({message:"Region created"})
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "server error"})
    }
})

let patchschema = joi.object({
    name: joi.string().min(2).max(55)
})

route.patch("/:id", async (req, res)=>{
    try {
        let {id} = req.params
        let region = await Region.findByPk(id)
        if(!region) return res.status(404).json({message: "region not found"})
        let {name} = req.body
        let { error } = patchschema.validate({name})
        if(error) return res.status(400).json({ message: error.details[0].message })
        await region.update({name})
        res.json({message:"Region updated"})
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "server error"})
    }
})

route.delete("/:id", async (req, res)=>{
    try {
        let {id} = req.params
        let region = await Region.findByPk(id)
        if(!region) return res.status(404).json({message: "region not found"})
        await region.destroy()
        res.json({message:"Region deleted"})
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "server error"})
    }
})

module.exports = route