import { useAuth } from '@/hooks/useAuth';

const ChatLayout = ({sidebar, chatWindow, headerContent}) => {
    const { logout } = useAuth();

    return (
        <div className='flex flex-col h-screen bg-gray-950'>
            {/* Header */}
            <header className='h-16 bg-gray-900 text-white flex items-center justify-between px-6 border-gray-700 shadow-md'>
                {headerContent || (
                    <div className="flex items-center justify-between w-full">
                    <h1 className="text-xl font-bold">Chat App</h1>
                    <div className="flex items-center gap-4">
                    {/* User info will go here */}
                    <button
                        type="button"
                        onClick={() => logout.mutate()}
                        disabled={logout.isPending}
                        className="text-sm cursor-pointer hover:text-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {logout.isPending ? 'Logging out...' : 'Logout'}
                    </button>
                    </div>
                </div>
                )}
            </header>

            <main className='flex flex-1 overflow-hidden'>
                {/* Sidebar */}
                <div className='w-1/3 min-w-[300px] border-r border-gray-700 bg-white'>
                    {sidebar}
                </div>

                {/* chatwindow */}
                <div className='flex-1 bg-gray-900'>
                    {chatWindow}
                </div>
            </main>

        </div>
    )
}

export default ChatLayout;