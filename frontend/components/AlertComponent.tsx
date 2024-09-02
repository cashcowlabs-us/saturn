import { FiX } from "react-icons/fi";
import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";

const AlertComponent = ({ show, setShow, children }: { show: boolean; setShow: (show: boolean) => void; children: React.ReactNode }) => (
    show && (
        <Alert className="mt-2 mb-4 bg-yellow-50 border-yellow-200 text-yellow-800 shadow-lg rounded-lg">
            <AlertDescription className="flex justify-between items-start">
                {children}
                <Button
                    variant="ghost"
                    className="h-4 w-4 p-0 text-yellow-800 hover:bg-yellow-100"
                    onClick={() => setShow(false)}
                >
                    <FiX size={14} />
                </Button>
            </AlertDescription>
        </Alert>
    )
);

export default AlertComponent