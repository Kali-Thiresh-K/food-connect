import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
}

export class SafeMapWrapper extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(_: Error): State {
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Map component crashed:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="h-[250px] w-full bg-muted rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground p-4 border border-border">
                    <AlertTriangle className="h-8 w-8 text-yellow-500" />
                    <p>Something went wrong with the map.</p>
                    <p className="text-xs">The location data might be invalid.</p>
                </div>
            );
        }

        return this.props.children;
    }
}
