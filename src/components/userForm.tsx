// src/components/UserForm.tsx
import { useForm } from 'react-hook-form';
import { Input, Button, Spacer } from '@nextui-org/react';
import { User } from 'next-auth';

interface UserFormProps {
    onSubmit: (data: Omit<User, 'id'>) => void;
    defaultValues?: Omit<User, 'id'>;
}

const UserForm: React.FC<UserFormProps> = ({ onSubmit, defaultValues }) => {
    const { register, handleSubmit, formState: { errors } } = useForm<Omit<User, 'id'>>({
        defaultValues,
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Input {...register('name', { required: true })} label="Name" fullWidth />
            {errors.name && <span>Name is required</span>}
            <Spacer y={1} />
            <Input {...register('email', { required: true })} label="Email" fullWidth />
            {errors.email && <span>Email is required</span>}
            <Spacer y={1} />
            <Button type="submit">Submit</Button>
        </form>
    );
};

export default UserForm;
