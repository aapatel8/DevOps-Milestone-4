# csc519-cm-special

| Team Member   | Unity ID | 
| ------------- | ----------- |
| Seth Butler      | scbutle2 |  
| Akshit Patel     | aapatel8 |
| Kunal Kulkarni | krkulkar |   
| Rezvan Mahdavi Hezaveh  |  rmahdav |

# Police Monkey

We added a Police Monkey to the project to prevent DDoS attacks.

## What is DDoS attak?

A Denial-of-Service attack (DoS attack) is a cyber-attack in which the perpetrator seeks to make a machine or network resource unavailable to its intended users by temporarily or indefinitely disrupting services of a host connected to the Internet. Denial of service is typically accomplished by flooding the targeted machine or resource with superfluous requests in an attempt to overload systems and prevent some or all legitimate requests from being fulfilled.

In a Distributed Denial-of-Service attack (DDoS attack), the incoming traffic flooding the victim originates from many different sources. This effectively makes it impossible to stop the attack simply by blocking a single source.

## What is the functionality of Police Monkey?

The architecture of the system is as follows:

![police monkey](https://media.github.ncsu.edu/user/8135/files/434c57ea-4fea-11e8-8ebc-d9dfd3b79e05)

The proxy check the IP address of the source of recieved request, if the number of requests of that IP is less that threshold the proxy send the request to the main server. In the case that the number of requests of that IP is more that threshold the proxy send the request to the Ploice Monkey.

Police monkey checks the IP and if it is in the black list it detects attack and block the request but if it is not in the black list the proxy shows a CAPTCHA to the user and if the user gives the correct answer the request will be sent to the main server. If the request is an attack so it cannot pass the CAPTCHA question and that IP address will be added to the black list and the request will be blocked.

# Project Screencast
