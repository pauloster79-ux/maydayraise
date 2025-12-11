import { getInvestorMessages } from '@/lib/data/messages';

export const dynamic = 'force-dynamic';

export default async function MessagesPage() {
    const messages = await getInvestorMessages();

    if (messages.length === 0) {
        return (
            <div className="text-center p-4 text-slate-500">
                No messages yet.
            </div>
        );
    }

    return (
        <div className="p-4 bg-transparent">
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                {messages.map((msg) => (
                    <div key={msg.id} className="break-inside-avoid bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                        <blockquote className="text-slate-700 text-lg leading-relaxed mb-4">
                            &quot;{msg.content}&quot;
                        </blockquote>
                        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                            <div>
                                <p className="font-semibold text-slate-900">{msg.author}</p>
                            </div>
                            <span className="text-xs text-slate-400">
                                {new Date(msg.date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
