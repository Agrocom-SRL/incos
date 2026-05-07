export const resolveStepByPath = (path, steps) => {
    return steps.find((step) => step.path === path) || steps[0];
};

export const resolveStepIndex = (stepKey, steps) => {
    return steps.findIndex((step) => step.key === stepKey);
};

export const resolveStepByKey = (stepKey, steps) => {
    return steps.find((step) => step.key === stepKey) || null;
};
