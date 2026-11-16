import { z } from 'zod';


class authValidator {
    
    static registerSchema = z.object({    
        name: z
            .string()
            .min(3)
            .max(100),
        email: z
            .email()
            .trim()
            .lowercase(),
        password: z
            .string()
            .min(8, 'Password must be at least 8 characters long'),
    })


    static loginSchema = z.object({    
        email: z
            .string()
            .lowercase('All letters should be in lower case')
            .trim()
            .min(3)
            .max(50),
        password: z
            .string()
            .min(8, 'Password must be at least 8 characters long')
            .max(50),
    })

}

export default authValidator;