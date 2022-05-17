## AWS STS AssumeRole Tutorial

#### Steps

1. Admin creates a role that grants Development account read/write access
2. Admin grants members of the group Developers permission to assume the created role
3. User requests access to the role to STS
4. STS returns the role temporary credentials
5. User access AWS resources by using the role credentials