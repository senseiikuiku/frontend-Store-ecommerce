import React from "react";
import "./footer.css";

export default function Footer() {
   return (
      <>
         <footer className="footer" id="footer">
            <div className="container">
               <div className="row">
                  <div className="column">
                     <a href="#">
                        <img
                           src="./src/assets/img/logo.png"
                           alt="grocerymart"
                           className="logo w-12 h-12"
                        />
                     </a>
                     <p className="desc">
                        Need to help for your new look? trust us. With cloth,
                        you becomes a lot confident with everybody.
                     </p>
                     <div className="list-icon">
                        <img
                           className="icon"
                           src="./src/assets/img/facebook.svg"
                           alt=""
                        />

                        <img
                           className="icon"
                           src="./src/assets/img/tiktok.svg"
                           alt=""
                        />

                        <img
                           className="icon"
                           src="./src/assets/img/twitter.svg"
                           alt=""
                        />

                        <img
                           className="icon"
                           src="./src/assets/img/instagram.svg"
                           alt=""
                        />
                     </div>
                  </div>
                  <div className="column">
                     <h3 className="title">Company</h3>
                     <div className="separate"></div>
                     <ul className="list-info">
                        <li>
                           <a href="#!">About Us</a>
                        </li>
                        <li>
                           <a href="#!">Features</a>
                        </li>
                        <li>
                           <a href="#!">Our Pricing</a>
                        </li>
                        <li>
                           <a href="#!">Latest News</a>
                        </li>
                     </ul>
                  </div>
                  <div className="column">
                     <h3 className="title">Support</h3>
                     <div className="separate"></div>
                     <ul className="list-info">
                        <li>
                           <a href="#!">FAQ’s</a>
                        </li>
                        <li>
                           <a href="#!">Terms & Conditions</a>
                        </li>
                        <li>
                           <a href="#!">Privacy Policy</a>
                        </li>
                        <li>
                           <a href="#!">Contact Us</a>
                        </li>
                     </ul>
                  </div>
                  <div className="column">
                     <h3 className="title">Address</h3>
                     <div className="separate"></div>
                     <ul className="list-info">
                        <li>
                           <a href="#!">
                              <strong>Location:</strong> 27 Division St, New
                              York, NY 10002, USA
                           </a>
                        </li>
                        <li>
                           <a href="mailto:email@gmail.com">
                              <strong>Email:</strong> email@gmail.com
                           </a>
                        </li>
                        <li>
                           <a href="tel:1234567890">
                              <strong>Phone:</strong> 1234 567 890
                           </a>
                        </li>
                     </ul>
                  </div>
               </div>
               <div className="separate-last"></div>
               <p className="desc-last">
                  Copyright ©2023 webdesign SGU. All rights reserved
               </p>
            </div>
         </footer>
      </>
   );
}
