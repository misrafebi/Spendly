const Category = require('../../models/categorySchema');
const User = require('../../models/userSchema');
const { options } = require('../../routes/userRouter');

// load category page
const laodCategoryPage = async (req, res) => {
    try {
        const email = req.session.userData

        const user = await User.findOne({ email }) 
        console.log('user: ', user);
        if (!user) {
            return res.redirect('/user/dashboard?message=User not found.&type=error')
        }

        const categories = await Category.find({
            $or: [{ User: null }, { User: user._id }]
        }).sort({ createdOn: -1 })


        const incomeCategories = categories.filter(cat => cat.type === 'income')
        const expenseCategories = categories.filter(cat => cat.type === 'expense')

        return res.render('categories', {
            activePage: 'category',
            user,
            categories
        })
    }
    catch (error) {
        res.status(500).send('server error')
        res.render('pageNotFound', {
            message: 'Something went wrong while loading the category page. Please try again shortly.'
        })
    }
}

// add category
const addCategory = async (req, res) => {

    try {
        const { categoryName, categoryType } = req.body
        const email = req.session.userData

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            })
        }

        const categoryExist = await Category.findOne({
            name: { $regex: `^${categoryName}$`, $options: 'i' },
            $or: [{ User: null }, { User: user._id }]
        })

        if (categoryExist) {
            return res.status(409).json({
                success: false,
                message: `You already have a category named "${categoryName}".`
            })
        }

        const newCategory = new Category({
            name: categoryName,
            type: categoryType,
            User: user._id
        })
        await newCategory.save()

        console.log('New Category added successfully.');

        return res.redirect('/user/category?message=Category added successfully.&type=success')

    } catch (error) {
        console.log(error);

    }
}

// edit category
const editCategory = async (req, res) => {
    try {
        const { id } = req.params

        const { name, type } = req.body

        const email = req.session.userData

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            })
        }

        const category = await Category.findById(id)
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found.'
            })
        }

        if (!category.User || category.User.toString() !== user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can not edit this category.'
            })
        }

        const duplicate = await Category.findOne({
            _id: { $ne: id },
            name: { $regex: `^${name.trim()}$`, $options: 'i' },
            $or: [{ User: null }, { User: user._id }]
        });

        if (duplicate) {
            console.log('Duplicate category');
            return res.status(409).json({
                success: false,
                message: `You already have category named: "${name}`
            })
        }

        category.name = name
        category.type = type
        await category.save()

        return res.status(200).json({
            success: true,
            message: 'Category edited successfully.'
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong while editing category.'
        })
    }
}

// delete category
const deleteCategory = async (req, res) => {    
    try {        
        const {id} = req.params
        // const id = req.params ❌
        // const {id} = req.params ✅
        // You need to destructure the id key out of req.params
        if (!id) {
            return res.status(500).json({
                success: false,
                message: 'Missing params.'
            })
        }

        const email=req.session.userData
        const user=await User.findOne({email})
        if(!user){
            return res.status(404).json({
                success:false,
                message:'User not found.'
            })
        }
        
        const category = await Category.findById(id)
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found.'
            })
        }
        
        if(!category.User || category.User.toString()!==user._id.toString()){
            return res.status(403).json({
                success:false,
                message:'You can not delete this category.'
            })
        }

        await Category.deleteOne({ _id: id });     
        return res.status(200).json({ 
            success: true,
            message: 'Category deleted successfully.'
        });

        
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:'Error while deleting category.'
        })
    }
}


module.exports = {
    laodCategoryPage,
    addCategory,
    editCategory,
    deleteCategory
}