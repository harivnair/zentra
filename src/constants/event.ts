export const STATUS_LABELS: Record<string, string> = {
    ENQUIRY_CREATED: "Enquiry Created",
    ESTIMATE_INPROGRESS: "Estimate In Progress",
    ESTIMATE_UNDER_REVIEW: "Estimate Under Review",
    ESTIMATE_APPROVED: "Estimate Approved",
    PROJECT_INPROGRESS: "Project In Progress",
    PROJECT_SETTLEMENT_IN_PROGRESS: "Project Settlement In Progress",
    PROJECT_COMPLETED: "Project Completed",
};

export const STATUS_COLORS: Record<string, string> = {
    ENQUIRY_CREATED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    ESTIMATE_INPROGRESS: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    ESTIMATE_UNDER_REVIEW:
        "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    ESTIMATE_APPROVED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    PROJECT_INPROGRESS: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    PROJECT_SETTLEMENT_IN_PROGRESS:
        "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
    PROJECT_COMPLETED: "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300",
};
