const Label = ({
    title,
    value,
    mono = false,
    badge = false,
    badgeColor = '',
}: {
    title: string;
    value: string;
    mono?: boolean;
    badge?: boolean;
    badgeColor?: string;
}) => {
    return (
        <div className="flex flex-col">
            <span className="text-xs text-gray-500 dark:text-gray-400">{title}</span>
            {badge ? (
                <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeColor}`}
                >
                    {value}
                </span>
            ) : (
                <span
                    className={`mt-0.5 text-sm ${mono ? 'font-mono text-gray-800 dark:text-gray-100' : 'text-gray-900 dark:text-white'
                        }`}
                >
                    {value}
                </span>
            )}
        </div>
    );
};

export { Label };
