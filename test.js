/*

const auth = require('../middleware/user_jwt');

// add, create (post)
router.post('/', auth, async (req, res, next) => {
    try {
        const toDo = await Todo.create({title: req.title, decription: req.body})

        if(!toDo) {
            return res.status(400).json({
                success: false,
                msg: "something went wrong"
            })
        }

        return res.status(200).json({
            success: true,
            todo: toDo,
            msg: "add complete"
        })
    }
    catch (error) {
        next(error);
    }

});

// select (GET)
router.get('/getTable', auth, async(req, res, next) => {

    try {
        const table = await Todo.find({user: req.user.id, finished: false});

        if(!table) {
            return res.status(400).json({success: false, msg: 'Something error happened'})
        }

        res.status(200).json({
            success: true,
            table: table,
            msg: "success"
        })
    } catch(error) {
        next(error); 
    }
}) 

// update (put)
router.put("/", async(req, res, next) => {
    try {
        let temp = await Todo.findById(req.params.id);

        if(!temp) {
            return res.status(200).json({success: false. msg: 'adsfsa'});
        }

        temp = await Todo.findByIdAndUpdate(req.params.id, req.body, {
            new: true.
            runValidators: true
        })

        if(!temp) {
            return res.status(400).json({success: false, msg: 'Something went wrong'});
        }

        return res.status(200).json({success: false, msg: 'success'});
    }
});


// method delete

// // example DELETE http://localhost:3000/todos/{id}/{categoryId}

router.delete('/:id/:categoryId', async(req, res, next) => {
    try {
        let toDo = await Todo.findById(req.params.id);

        if(!toDo) {
            return res.status(400).json({
                success: false,
                msg: 'task Todo not exits'
            });
        }
        
        toDo = await Todo.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            msg: 'Successfully'
        });
    } catch (error) {
        next(error);
    }

});


*/