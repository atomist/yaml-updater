/*
 * Copyright © 2019 Atomist, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as assert from "power-assert";

import { updateYamlKey } from "../lib/yaml";

describe("updateYamlKey spaces", () => {

    /* tslint:disable:no-trailing-whitespace */
    it("should preserve trailing space when updating", () => {
        const orig = `management:
  cloudfoundry:
    skip-ssl-validation: true
  info:
    git:
      mode: full

  
  
logging:
  level:
    root: INFO
    org.springframework: INFO
    org.axonframework: DEBUG
    com.idugalic: DEBUG
    
authserver:
  hostname: localhost
  port: 9999
  contextPath: uaa


      
security:
  oauth2:
    resource:
      jwt:
        keyUri: http://\${authserver.hostname}:\${authserver.port}/\${authserver.contextPath}/oauth/token_key
`;
        const updates = {
            level: {
                "com.atomist.spring.agent": "DEBUG",
            },
        };
        const expected = `management:
  cloudfoundry:
    skip-ssl-validation: true
  info:
    git:
      mode: full

  
  
logging:
  level:
    root: INFO
    org.springframework: INFO
    org.axonframework: DEBUG
    com.idugalic: DEBUG
    com.atomist.spring.agent: DEBUG
    
authserver:
  hostname: localhost
  port: 9999
  contextPath: uaa


      
security:
  oauth2:
    resource:
      jwt:
        keyUri: http://\${authserver.hostname}:\${authserver.port}/\${authserver.contextPath}/oauth/token_key
`;
        assert(updateYamlKey("logging", updates, orig) === expected);
    });

    it("should preserve trailing space when deleting", () => {
        const orig = `management:
  cloudfoundry:
    skip-ssl-validation: true
  info:
    git:
      mode: full

  
  
logging:
  level:
    root: INFO
    org.springframework: INFO
    org.axonframework: DEBUG
    com.idugalic: DEBUG
    com.atomist.spring.agent: DEBUG
    
authserver:
  hostname: localhost
  port: 9999
  contextPath: uaa


      
security:
  oauth2:
    resource:
      jwt:
        keyUri: http://\${authserver.hostname}:\${authserver.port}/\${authserver.contextPath}/oauth/token_key
`;
        const updates = {
            level: {
                // tslint:disable-next-line:no-null-keyword
                "com.atomist.spring.agent": null,
            },
        };
        const expected = `management:
  cloudfoundry:
    skip-ssl-validation: true
  info:
    git:
      mode: full

  
  
logging:
  level:
    root: INFO
    org.springframework: INFO
    org.axonframework: DEBUG
    com.idugalic: DEBUG
    
authserver:
  hostname: localhost
  port: 9999
  contextPath: uaa


      
security:
  oauth2:
    resource:
      jwt:
        keyUri: http://\${authserver.hostname}:\${authserver.port}/\${authserver.contextPath}/oauth/token_key
`;
        assert(updateYamlKey("logging", updates, orig) === expected);
    });

});
