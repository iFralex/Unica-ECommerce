export const TextDetail = async ({ title, children }: { title: string, children: ReactNode }) => {
    return <p>{title}: <span className="font-bold">{children}</span></p>
}

export const ContainerDashboard = async ({ title, backButton, children }: { title: string, backButton?: { lable: string, url: string, icon: ReactNode }, children: ReactNode }) => {
    return <div className="flex flex-1 flex-col">
        <div className="flex items-center">
            <div className="flex flex-wrap items-center w-full gap-4">
                {backButton && <Button variant="link">
                    <Link href={"/dashboard" + backButton.url} className="flex items-center">
                        {backButton.icon}
                        <span>{backButton.lable}</span>
                    </Link>
                </Button>}
                <h1 className="text-lg font-semibold md:text-2xl uppercase">{title}</h1>
            </div>
        </div>
        <div className="flex flex-1 items-start justify-center rounded-lg border border-dashed shadow-sm" x-chunk="dashboard-02-chunk-1">
            {children}
        </div>
    </div>
}
