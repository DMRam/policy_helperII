export const UserAvatar = ({ name, className = '' }:any) => {
    const initials = name ? name.split(' ').map((n: any[]) => n[0]).join('') : 'US';

    return (
        <div className={`inline-flex items-center justify-center h-10 w-10 rounded-full bg-blue-500 text-white font-medium ${className}`}>
            {initials}
        </div>
    );
};