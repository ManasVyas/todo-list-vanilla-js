const yup = require("yup");

const registerUserSchema = yup.object().shape({
  username: yup.string().required(),
  password: yup.string().required(),
  role: yup.string().required(),
});

const loginUserSchema = yup.object().shape({
    username: yup.string().required(),
    password: yup.string().required(),
})

const updateUserSchema = yup.object().shape({
  userId: yup.number().required(),
  username: yup.string().required(),
  password: yup.string().required(),
  role: yup.string().required(),
})

const validateUser = async (schema, body) => {
  try {
    let validatedBody = {};
    validatedBody = await schema.validate(body);
    return validatedBody;
    // req.body = validatedBody;
    // res.locals.validatedBody = req.body;
  } catch (error) {
    return ({ status: "error", message: error.message });
  }
};

const validation = {
  registerUserSchema,
  loginUserSchema,
  updateUserSchema,
  validateUser,
};

module.exports = validation;
