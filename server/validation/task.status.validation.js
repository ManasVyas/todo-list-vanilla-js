const yup = require("yup");

const addTaskStatusSchema = yup.object().shape({
  taskStatusName: yup.string().required(),
});

const updateTaskStatusSchema = yup.object().shape({
  taskStatusId: yup.number().required(),
  taskStatusName: yup.string().required(),
  createdOn: yup.date().required(),
  updatedOn: yup.date().required(),
});

const validateTaskStatus = (schema, type) => {
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
  addTaskStatusSchema,
  updateTaskStatusSchema,
  validateTaskStatus,
};

module.exports = validation;
