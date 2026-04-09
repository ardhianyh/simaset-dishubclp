import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationProps {
    links: PaginationLink[];
    from: number;
    to: number;
    total: number;
}

export default function Pagination({ links, from, to, total }: PaginationProps) {
    if (links.length <= 3) return null;

    return (
        <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm">
                Menampilkan {from} - {to} dari {total} data
            </p>
            <div className="flex items-center gap-1">
                {links.map((link, i) => {
                    const isFirst = i === 0;
                    const isLast = i === links.length - 1;

                    if (isFirst) {
                        return (
                            <Button
                                key="prev"
                                variant="outline"
                                size="icon"
                                className="size-8"
                                disabled={!link.url}
                                asChild={!!link.url}
                            >
                                {link.url ? (
                                    <Link href={link.url}>
                                        <ChevronLeft className="size-4" />
                                    </Link>
                                ) : (
                                    <span>
                                        <ChevronLeft className="size-4" />
                                    </span>
                                )}
                            </Button>
                        );
                    }

                    if (isLast) {
                        return (
                            <Button
                                key="next"
                                variant="outline"
                                size="icon"
                                className="size-8"
                                disabled={!link.url}
                                asChild={!!link.url}
                            >
                                {link.url ? (
                                    <Link href={link.url}>
                                        <ChevronRight className="size-4" />
                                    </Link>
                                ) : (
                                    <span>
                                        <ChevronRight className="size-4" />
                                    </span>
                                )}
                            </Button>
                        );
                    }

                    return (
                        <Button
                            key={link.label}
                            variant={link.active ? 'default' : 'outline'}
                            size="icon"
                            className="size-8"
                            asChild={!!link.url && !link.active}
                        >
                            {link.url && !link.active ? (
                                <Link href={link.url}>{link.label}</Link>
                            ) : (
                                <span>{link.label}</span>
                            )}
                        </Button>
                    );
                })}
            </div>
        </div>
    );
}
