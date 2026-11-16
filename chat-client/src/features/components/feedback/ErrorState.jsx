import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/features/ui/button";

const ErrorState = ({
    text = "Something went wrong.",
    description = "Please try again later.",
    retry,
    buttonText = "Retry",
    className = "",
}) => {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center gap-4 py-12 text-center",
                className
            )}
        >
            <AlertTriangle className="h-12 w-12 text-red-500" />

            <div>
                <h2 className="text-xl font-semibold text-white">
                    {text}
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                    {description}
                </p>
            </div>

            {retry && (
                <Button onClick={retry}>
                    {buttonText}
                </Button>
            )}
        </div>
    );
};

export default ErrorState;


{/* <ErrorState />
<ErrorState
    text="Failed to load cases."
/>
<ErrorState
    text="Unauthorized."
    description="Please login again."
/>
<ErrorState
    retry={refetch}
/>
<ErrorState
    retry={refetch}
    buttonText="Try Again"
/> */}
