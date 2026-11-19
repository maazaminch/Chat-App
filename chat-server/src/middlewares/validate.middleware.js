import ApiError from '../utils/apiError.js';

const TARGETS = ['body', 'params', 'query', 'headers'];

const validate = (schema) => async (req, res, next) => {
    try {
        const validatedData = {};
        const errors = [];
        const shape = schema.shape ?? {};
        const hasTargetSchemas = TARGETS.some((target) =>
            Object.hasOwn(shape, target)
        );
        const schemasToValidate = hasTargetSchemas
            ? TARGETS
                .filter((target) => shape[target])
                .map((target) => [target, shape[target]])
            : [['body', schema]];

        for (const [target, targetSchema] of schemasToValidate) {
            const result = await targetSchema.safeParseAsync(req[target] ?? {});

            if (result.success) {
                validatedData[target] = result.data;
            } else {
                errors.push(...result.error.issues.map(issue => ({
                    target, // target identifies where the invalid data came from.
                    field: issue.path.join('.'), // field identifies the specific field that failed validation.
                    message: issue.message // explains the problem.
                })));
            }
        }

        if (errors.length > 0) {
            return next(new ApiError(400, 'Validation Error', errors));
        }

        if (validatedData.body) {
            req.body = validatedData.body;
        }

        req.validatedData = validatedData;
        return next();
    } catch (error) {
        return next(error);
    }
};


export default validate;