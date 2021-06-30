const yup = require("yup");

const addTaskSchema = yup.object().shape({
  taskName: yup.string().required(),
  userId: yup.number().required(),
});

const updateTaskSchema = yup.object().shape({
  taskId: yup.number().required(),
  taskName: yup.string().required(),
  taskStatusId: yup.number().required(),
  createdOn: yup.date().required(),
  updatedOn: yup.date().required(),
  userId: yup.number().required(),
});

const validateTask = (schema, type) => {
  return async (req, res, next) => {
    try {
      let validatedBody = {};
      if (type === "add") {
        validatedBody = await schema.validate(req.body);
      } else {
        validatedBody = await schema.validate(req.body);
      }
      req.body = validatedBody;
      next();
    } catch (error) {
      error.status = 400;
      next(error);
    }
  };
};

const validation = {
  addTaskSchema,
  updateTaskSchema,
  validateTask,
};

module.exports = validation;
