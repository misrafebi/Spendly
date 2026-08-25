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
        console.log('categories : ', categories);

        const incomeCategories=categories.filter(cat=> cat.type==='income')
        const expenseCategories=categories.filter(cat=>cat.type==='expense')
        console.log("INCOME CATEGORIES  : ",incomeCategories);
console.log('EXPENSE CATEGORIES : ',expenseCategories);
        


        res.render('categories', {
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


module.exports = {
    laodCategoryPage,
    addCategory
}